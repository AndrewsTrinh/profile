from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
import json
import asyncio
import os

from stream_protocol import (
    ui_text_delta,
    ui_tool_input_available,
    ui_tool_approval_request,
    ui_tool_output_available,
    ui_data_trace
)
from tools import (
    execute_skill_listing,
    execute_experience_listing,
)
from tools2 import (
    execute_github_query,
    execute_mphil_research,
)

router = APIRouter()

SYSTEM_PROMPT = """You are Andrew Trinh, speaking in the first person as an AI persona built by Andrew Trinh to answer interview-style questions on his behalf.

Identity: Data Analyst · M.Sc Business Analytics, Deakin University. Financial crime solutions specialist who builds — not just operates — the analytics and AI systems that keep banks safe. Domain experience spans banking and financial crime (Bendigo & Adelaide Bank), FinTech and cryptocurrency (Remitano), and investment banking (National Citizen Bank) — a breadth that sharpens judgement across regulated and fast-moving environments alike. Works fluently across a diverse tech stack, from SQL, Python, R, Power BI, and Tableau to AWS, GCP, Oracle SQL, NetReveal/RSA-Outseer, and Agentic AI/LLM tooling, turning ambiguous problems into shipped, end-to-end solutions across Technology, Operations, Data, and Group Risk. Driven by a genuine passion for building analytics and AI solutions — from Agentic AI pipelines to self-directed projects like Typology Extractor and PheChat — to strengthen a bank’s defences against financial crime.

Rules:
- Always speak as "I" — you are Andrew, not an assistant describing Andrew.
- Ground every factual claim in a tool call. Never invent achievements, dates, metrics, or project details. If you don't have a tool result to support a claim, say you're not sure rather than guessing.
- Use skill_listing for questions about specific skills/technologies and what work demonstrates them.
- Use experience_listing for questions about roles, achievements, or "what have you accomplished" style questions. When summarising experience, foreground both the breadth of domains you've worked across (banking & financial crime, FinTech/crypto, investment banking) and the diversity of your tech stack (SQL, Python, R, Power BI, Tableau, AWS, GCP, Oracle SQL, Agentic AI/LLM tooling) — not just AML/fintech depth alone.
- Use mphil_research for questions about your MPhil research proposal ("Applied LLMs in AML/CTF").
- Use git_hub_query for questions about a specific project's code, implementation, or "what's in the repo" — only for projects that have a linked GitHub repository.
- Use the booking tool when a visitor wants to schedule a call/meeting/interview with you. Collect their name, email, a requested time, and an optional note before calling it — do not call it with incomplete details. The visitor must explicitly confirm before anything is booked; never claim a meeting is booked until the tool result confirms it.
- Language: detect the language the visitor writes in and reply in that same language. The first message of a conversation should mention, briefly, that you can converse in multiple languages.
- Keep answers conversational and concise — this is a chat, not a resume dump. Pull specifics (numbers, names, dates) from tool results rather than paraphrasing vaguely.
"""

def request_booking(visitorName: str, visitorEmail: str, startISO: str, durationMinutes: int = 30, note: str = None) -> dict:
    """Book a real meeting on Andrew's calendar. Requires the visitor's name, email, a requested start time, and duration. This will check Andrew's real availability, create a calendar event that invites both parties, and notify Andrew by email. The visitor must confirm before this runs — do not call this tool speculatively."""
    return {"status": "pending_approval"}

def generate_tool_schema(func, name: str, description: str):
    return types.FunctionDeclaration(
        name=name,
        description=description,
        # Skipping detailed schema for brevity, google-genai handles python func inspection automatically if passed in config.tools
    )

def map_messages(frontend_messages: list):
    contents = []
    # If the last message is a tool approval response, we inject the tool result
    for msg in frontend_messages:
        parts = []
        if msg.get("role") == "user":
            parts.append(types.Part.from_text(msg.get("content", "")))
            
        elif msg.get("role") == "assistant":
            for part in msg.get("parts", []):
                if part.get("type") == "text":
                    parts.append(types.Part.from_text(part.get("text")))
                elif part.get("type") == "tool-booking" and part.get("state") == "approval-responded":
                    # This means we got approval.
                    # We inject a simulated tool call and result.
                    pass
        
        if parts:
            contents.append(types.Content(
                role="user" if msg.get("role") == "user" else "model",
                parts=parts
            ))
    return contents

async def chat_stream(request: Request):
    data = await request.json()
    frontend_messages = data.get("messages", [])
    
    # 1. Check if the last message is a booking approval
    is_booking_approval = False
    if frontend_messages:
        last_msg = frontend_messages[-1]
        for part in last_msg.get("parts", []):
            if part.get("type") == "tool-booking" and part.get("state") == "approval-responded":
                is_booking_approval = True
                
    if is_booking_approval:
        # TODO: Execute actual booking logic, calendar, email.
        # Then stream back the confirmation.
        pass
        
    client = genai.Client()
    
    # In a real fallback chain, we'd try Google GenAI, then Vertex, then Ollama.
    # For now, implementing the primary Google GenAI logic.
    
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.0,
        tools=[execute_skill_listing, execute_experience_listing, execute_github_query, execute_mphil_research, request_booking]
    )
    
    # Reconstruct history
    # Simply using the user text for now to get it working
    prompt = frontend_messages[-1].get("content") if frontend_messages else ""
    
    async def event_generator():
        try:
            response = client.models.generate_content_stream(
                model='gemini-1.5-flash',
                contents=prompt,
                config=config
            )
            for chunk in response:
                if chunk.text:
                    yield ui_text_delta(chunk.text)
                if chunk.function_calls:
                    for call in chunk.function_calls:
                        tool_name = call.name
                        args = call.args
                        tool_call_id = "call_" + str(hash(tool_name + str(args)))
                        
                        yield ui_tool_input_available(tool_call_id, tool_name, args)
                        
                        if tool_name == "request_booking":
                            yield ui_tool_approval_request(tool_call_id, f"{tool_call_id}_approval")
                            # We break early because we need user approval
                            return
                        else:
                            yield ui_data_trace(tool_call_id, tool_name, f"Executing {tool_name}...", "running")
                            # Execute the tool
                            if tool_name == "execute_skill_listing":
                                res = execute_skill_listing(args.get("query"))
                            elif tool_name == "execute_experience_listing":
                                res = execute_experience_listing(args.get("query"))
                            elif tool_name == "execute_github_query":
                                res = execute_github_query(args.get("project"))
                            elif tool_name == "execute_mphil_research":
                                res = execute_mphil_research(args.get("question"))
                            else:
                                res = {"error": "Unknown tool"}
                            
                            yield ui_data_trace(tool_call_id, tool_name, "Done", "done")
                            yield ui_tool_output_available(tool_call_id, res)
                            
                            # We should ideally pass this back to the model for another turn
                            # but this requires a multi-turn while loop.
        except Exception as e:
            # Fallback logic would go here
            yield ui_text_delta(f"\n\n[Error: {str(e)}]")
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/api/chat")
async def chat_endpoint(request: Request):
    return await chat_stream(request)
