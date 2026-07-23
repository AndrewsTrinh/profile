from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
from datetime import datetime, timedelta
import json
import asyncio
import os

from stream_protocol import (
    ui_finish,
    ui_text_start,
    ui_text_end,
    ui_text_delta,
    ui_tool_input_available,
    ui_tool_approval_request,
    ui_tool_output_available,
    ui_data_trace
)
from tools2 import (
    execute_github_query,
    execute_mphil_research,
    execute_resume_search,
    execute_lookup_booking,
    execute_behavioral_search,
)
from bookings_lib import Booking, insert_booking


from fastapi import BackgroundTasks

def log_chat_session(session_id: str, history: list):
    try:
        from rag_lib import get_connection
        client = genai.Client()
        
        # We only want to summarize user messages
        user_messages = [c.parts[0].text for c in history if c.role == "user" and c.parts and c.parts[0].text]
        if not user_messages:
            return
            
        summary_prompt = "Summarize the following chat history of a user interacting with Andrew's AI portfolio in 1-2 sentences. Focus on what the user is looking for or asking about:\n" + "\n".join(user_messages)
        
        summary_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=summary_prompt,
        )
        summary = summary_response.text.strip()
        
        with get_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO chat_logs (session_id, summary, message_count) 
                VALUES (%s, %s, %s)
                ON CONFLICT (session_id) 
                DO UPDATE SET summary = EXCLUDED.summary, message_count = EXCLUDED.message_count, updated_at = now()
                """,
                (session_id, summary, len(history))
            )
            conn.commit()
    except Exception as e:
        print("Error logging chat:", e)


router = APIRouter()

SYSTEM_PROMPT = """You are Andrew Trinh, speaking in the first person as an AI persona built by Andrew Trinh to answer interview-style questions on his behalf.

Identity:
I am a Financial Crime Solutions Analyst with an M.Sc in Business Analytics from Deakin University. I specialise in building — not just operating — machine learning, AI, and LLM-powered systems that strengthen a bank’s defences against financial crime. My domain experience spans:

- Banking and financial crime: Bendigo & Adelaide Bank, Intelligence & Analytics – Financial Crime Risk, focusing on transaction monitoring, scenario management, and detection system governance.
- FinTech and cryptocurrency: Remitano, where I owned analytics, ETL, and predictive modelling for an international crypto exchange operating in 30+ countries.
- Investment banking: National Citizen Bank, where I built financial models and investment procedures supporting a public equity portfolio with a 10% CAGR.

I work fluently across a diverse tech stack — SQL, Python, R, Power BI, Tableau, AWS, GCP, Oracle SQL, NetReveal/RSA-Outseer, and Agentic AI/LLM tooling — and I use that breadth to turn ambiguous risk and analytics problems into shipped, end-to-end solutions across Technology, Operations, Data, and Group Risk.

I’ve built self-directed AI products like:
- Typology Extractor: an Agentic AI/ETL pipeline that transforms AUSTRAC guidance into structured typology data for enforcement-gap detection and national scenario benchmarking.
- PheChat: an Agentic RAG chatbot for SMEs that combines retrieval-augmented generation with autonomous agent workflows to answer customer queries and automate routine tasks.

Within Bendigo & Adelaide Bank I’ve:
- Co-delivered an AI-driven UAR-to-SMR submission automation pipeline using Pydantic-validated LLM prompting and secure masking/rehydration, cutting regulatory reporting preparation time by ~80% while maintaining transparency and privacy.
- Led scenario management work, including Annual Rule Reviews that cut false positives by ~5% and removed 5,000+ alerts per year, and coordinating the delivery of nine new detection scenarios in 2025, personally building three with statistically significant true positive uplift.
- Built and maintained Oracle SQL automation pipelines feeding 150+ alerts per day into NetReveal/RSA-Outseer with 99.9% data integrity, and stood up dashboards and infrastructure (Power BI Server, GitLab) underpinning the transaction monitoring product.

I’ve invested heavily in formal AI/ML learning:
- Anthropic: Claude Code in Action, Building with the Claude API, Introduction to Agent Skills, Introduction to Subagents, AI Fluency Framework & Foundations.
- Google Cloud: BigQuery ML skill badges (Engineer Data for Predictive Modeling; Create ML Models with BigQuery ML).

Tone & style:
- I speak in a confident, structured, McKinsey-style voice: clear, direct, and analytical.
- I organise answers logically (context → problem → actions → impact → reflection), and I quantify impact wherever the data allows (e.g., % reductions, volumes, time saved).
- I treat each question like a brief case: I clarify the situation, outline my approach, then walk through evidence-backed outcomes and what I’d do next.

Rules:
- I always speak as “I” — I am Andrew in this persona, not an assistant describing Andrew.
- I ground every factual claim in tool calls. I never invent achievements, dates, metrics, or project details. If I don’t have a tool result to support a claim, I say I’m not certain rather than guessing.
- I use `resume_search` for any question about my background, skills, technologies, roles, achievements, education, certificates, projects, or awards, and I base my answer strictly on what is retrieved.
  - When summarising my experience or skills, I foreground both:
    - The breadth of domains I’ve worked across (banking & financial crime, FinTech/crypto, investment banking), and
    - The diversity of my tech stack (SQL, Python, R, Power BI, Tableau, AWS, GCP, Oracle SQL, NetReveal/RSA-Outseer, Agentic AI/LLM tooling) — not just AML depth alone.
- I use `mphil_research` for questions about my MPhil research proposal (“Applied LLMs in AML/CTF”), including motivation, methodology, and potential impact.
- I use `git_hub_query` for questions about a specific project’s code, implementation, or repository contents — only for projects with a linked GitHub repo. For “what is this project” / “why did you build it” / “what business problem does it solve”, I use `resume_search`.
- I use the booking tool when a visitor wants to schedule a call/meeting/interview with me. To do so, I collect: Name, Email, Requested time, and Preferred meeting location. I can infer missing details from context. Allow flexible date/time formats (e.g., "next 2 days", "next week") and IMMEDIATELY convert them to an ISO 8601 string for the tool. If they give a flexible time, pick a reasonable default business time. Default to the current year. If they provide incomplete or conflicting location info, make a reasonable assumption (e.g., default to a Zoom Call or Google Meet) rather than asking for clarification. CRITICAL RULE: NEVER ask the user to confirm the details in chat. As soon as I have enough info to guess the details, I IMMEDIATELY call the booking tool. The tool itself will generate a confirmation UI card. Do NOT ask for clarification before calling the tool.
- I mention briefly in the first message that I can converse in multiple languages, then reply in the visitor’s language for the rest of the conversation.
- I keep answers conversational and concise. I don’t dump my entire resume; instead, I select the most relevant examples and back them with specific numbers, names, and dates from tool results.
- - I use `behavioral_question_retrieve` to retrieve information when the user asks behavioral questions like 'tell me about a time when...' or 'how do you handle...'.
- For behavioural questions, I default to a STAR/consulting case structure (Situation, Task, Action, Result, Reflection), and I use AI-related achievements (Typology Extractor, PheChat, UAR-to-SMR automation) whenever the question touches AI, innovation, or technical leadership. Task Decomposition: For broad questions like "what is your biggest achievement", do not rely on a single narrow search. Decompose the request and make multiple targeted `resume_search` calls simultaneously (e.g., searching for "awards", "impact", "Bendigo", "Typology Extractor") to gather comprehensive evidence before consolidating and formatting the final answer beautifully.
- Always think before responding. If a question is entirely outside the scope of my professional experience, projects, or MPhil research, OR if the tools return empty results/no information, do not generate a nonsense response, blank text, or guess. Instead, politely explain that this topic isn't covered in my prepared material, and smoothly pivot to asking if they want to have a coffee and chat about it. If they say yes or express interest, immediately trigger the booking tool.
"""


def build_history(frontend_messages):
    contents = []
    for msg in frontend_messages:
        role = msg.get("role")
        parts = msg.get("parts", [])
        
        if role == "user":
            text_parts = [p.get("text") for p in parts if p.get("type") == "text" and p.get("text")]
            if text_parts:
                contents.append(types.Content(role="user", parts=[types.Part.from_text(text="".join(text_parts))]))
                
        elif role == "assistant":
            # An assistant message might contain:
            # 1. A tool call (model)
            # 2. A tool response (user)
            # 3. Synthesized text (model)
            # We must interleave them carefully to maintain user -> model -> user sequence
            
            for p in parts:
                ptype = p.get("type", "")
                if ptype.startswith("tool-"):
                    tool_name = ptype[5:]
                    args = p.get("input", {})
                    
                    # 1. The call
                    contents.append(types.Content(role="model", parts=[types.Part.from_function_call(name=tool_name, args=args)]))
                    
                    # 2. The response
                    state = p.get("state")
                    if state in ("output-available", "approval-responded", "result"):
                        if state == "approval-responded":
                            approval = p.get("approval", {})
                            out = p.get("output") or {"approved": approval.get("approved")}
                        else:
                            out = p.get("output", {})
                        contents.append(types.Content(role="user", parts=[types.Part.from_function_response(name=tool_name, response=out)]))
                        
                elif ptype == "text" and p.get("text"):
                    # 3. The text
                    contents.append(types.Content(role="model", parts=[types.Part.from_text(text=p.get("text"))]))
                
    if not contents:
        return []
        
    compacted = []
    current_role = contents[0].role
    current_parts = list(contents[0].parts)
    
    for c in contents[1:]:
        if c.role == current_role:
            current_parts.extend(c.parts)
        else:
            compacted.append(types.Content(role=current_role, parts=current_parts))
            current_role = c.role
            current_parts = list(c.parts)
            
    compacted.append(types.Content(role=current_role, parts=current_parts))
    return compacted


def booking(visitorName: str, visitorEmail: str, startISO: str, durationMinutes: int = 30, location: str = None, visitorPhone: str = None, note: str = None) -> dict:
    """Book a real meeting on Andrew's calendar. Requires the visitor's name, email, a requested start time, duration, and their preferred meeting location (e.g. a video call link/platform, phone, or in-person address). Their phone number is optional but lets them look up this booking later via lookup_booking. This will check Andrew's real availability and create a calendar event that invites both parties — Google Calendar sends the invite emails automatically. The visitor must confirm before this runs — do not call this tool speculatively."""
    return {"status": "pending_approval"}


def resume_search(query: str) -> dict:
    '''Search Andrew's background, skills, technologies, roles, achievements, education, certificates, projects, or awards.'''
    return execute_resume_search(query)

def mphil_research(question: str) -> dict:
    '''Answer questions about Andrew's MPhil research proposal ("Applied LLMs in AML/CTF").'''
    return execute_mphil_research(question)

def git_hub_query(project: str) -> dict:
    '''Look up a specific project's code, implementation, or repository contents on GitHub.'''
    return execute_github_query(project)


def behavioral_question_retrieve(query: str) -> dict:
    '''Retrieve information when the user asks behavioral questions like 'tell me about a time when...' or 'how do you handle...'.'''
    return execute_behavioral_search(query)

def lookup_booking(email: str = None, phone: str = None) -> dict:
    '''Look up an existing booking a visitor has made.'''
    return execute_lookup_booking(email, phone)

async def _handle_booking_approval(part: dict) -> StreamingResponse:
    tool_call_id = part.get("toolCallId", "booking_call")
    booking_input = part.get("input", {}) or {}
    approved = bool((part.get("approval") or {}).get("approved"))

    async def event_generator():
        # Generate a random ID for the new text block so the AI SDK safely appends it as a new assistant message.
        import random
        msg_id = f"msg_{random.randint(1000, 9999)}_confirm"

        try:
            if not approved:
                yield ui_text_start(msg_id)
                yield ui_text_delta("No worries — let me know if you'd like to pick a different time.", id=msg_id)
                yield ui_text_end(msg_id)
                return

            visitor_name = booking_input.get("visitorName", "")
            visitor_email = booking_input.get("visitorEmail", "")
            visitor_phone = booking_input.get("visitorPhone")
            start_iso = booking_input.get("startISO")
            duration_minutes = booking_input.get("durationMinutes", 30)
            location = booking_input.get("location")
            note = booking_input.get("note")

            try:
                start_dt = datetime.fromisoformat(start_iso)
            except (TypeError, ValueError):
                yield ui_text_start(msg_id)
                yield ui_text_delta("Something went wrong reading that time — could you try again?", id=msg_id)
                yield ui_text_end(msg_id)
                return

            yield ui_data_trace(tool_call_id, "booking", "Confirming coffee chat...", "running")

            try:
                insert_booking(Booking(
                    visitor_name=visitor_name,
                    visitor_email=visitor_email,
                    visitor_phone=visitor_phone,
                    start_iso=start_dt,
                    duration_minutes=duration_minutes,
                    location=location,
                    note=note,
                ))
            except Exception:
                yield ui_data_trace(tool_call_id, "booking", "Booking failed", "done")
                yield ui_text_start(msg_id)
                yield ui_text_delta("I'm sorry, I couldn't save your booking to the database. Please try again.", id=msg_id)
                yield ui_text_end(msg_id)
                return

            # Format date for response
            formatted_date = start_dt.strftime("%A, %B %d, %Y at %I:%M %p")
            loc_str = location if location else "a video call"

            yield ui_data_trace(tool_call_id, "booking", "Booked", "done")
            yield ui_tool_output_available(tool_call_id, {"booked": True})

            yield ui_text_start(msg_id)
            yield ui_text_delta(f"Awesome! You have a coffee chat with me on **{formatted_date}** at **{loc_str}**. Looking forward to it!", id=msg_id)
            yield ui_text_end(msg_id)
        except Exception:
            import traceback
            traceback.print_exc()
            yield ui_text_start(msg_id)
            yield ui_text_delta("Sorry, something went wrong confirming that booking — could you try again?", id=msg_id)
            yield ui_text_end(msg_id)
        finally:
            yield ui_finish("stop")

    return StreamingResponse(event_generator(), media_type="text/event-stream")

async def chat_stream(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    frontend_messages = data.get("messages", [])
    session_id = data.get("sessionId", "unknown")

    # 1. Check if the last message is a booking approval response
    booking_part = None
    if frontend_messages:
        last_msg = frontend_messages[-1]
        for part in last_msg.get("parts", []):
            if part.get("type") == "tool-booking" and part.get("state") == "approval-responded":
                booking_part = part
                break

    if booking_part is not None:
        return await _handle_booking_approval(booking_part)

    client = genai.Client()
    
    # Validation gate
    if frontend_messages:
        last_user_msg = frontend_messages[-1]
        if last_user_msg.get("role") == "user":
            user_text = ""
            for part in last_user_msg.get("parts", []):
                if part.get("type") == "text":
                    user_text += part.get("text", "")
            
            if user_text:
                val_prompt = f"Analyze the following user input sent to Andrew Trinh's professional AI portfolio chatbot. Is it meaningful and relevant? Relevant topics include: professional greetings, asking about Andrew's background, financial crime, data analytics, scheduling a meeting, or general professional chat. If the input is complete gibberish (e.g., 'asdf') OR entirely irrelevant to a professional setting (e.g., 'how to cook pasta', 'tell me a joke'), answer strictly with 'INVALID'. Otherwise, answer 'VALID'.\n\nInput: '{user_text}'"
                try:
                    val_res = await client.aio.models.generate_content(model='gemini-2.5-flash', contents=val_prompt)
                    print(f"Validation result for '{user_text}':", val_res.text)
                    if "INVALID" in val_res.text.strip().upper():
                        async def reject_stream():
                            yield ui_text_start("msg_rejected")
                            yield ui_text_delta("This doesn't seem relevant to my professional background. I'm here to discuss my experience in data analytics, financial crime, and AI. Please ask a relevant question, or let me know if you'd like to schedule a coffee chat!", id="msg_rejected")
                            yield ui_text_end("msg_rejected")
                        return StreamingResponse(reject_stream(), media_type="text/event-stream")
                except Exception as e:
                    print("Validation error:", e)
                    pass # Proceed if validation fails

    
    # In a real fallback chain, we'd try Google GenAI, then Vertex, then Ollama.
    # For now, implementing the primary Google GenAI logic.
    
    config = types.GenerateContentConfig(
        system_instruction=f"Today is {datetime.now().strftime('%A, %B %d, %Y')}.\n\n{SYSTEM_PROMPT}",
        temperature=0.0,
        tools=[resume_search, git_hub_query, mphil_research, behavioral_question_retrieve, lookup_booking, booking],
        # Without this, google-genai's Automatic Function Calling transparently executes
        # our tool functions itself and never surfaces chunk.function_calls the way the
        # dispatch loop below expects — silently bypassing our trace events and, more
        # importantly, the booking approval gate.
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
    )
    
    contents = build_history(frontend_messages)
    
    async def event_generator():
        nonlocal contents
        try:
            while True:
                response = await client.aio.models.generate_content_stream(
                    model='gemini-2.5-flash',
                    contents=contents,
                    config=config
                )
                
                tool_calls_made = []
                model_parts = []
                
                text_started = False
                msg_id = "msg_" + str(hash(contents[-1].parts[0].text if contents and contents[-1].parts else "new"))
                async for chunk in response:
                    if chunk.text:
                        if not text_started:
                            yield ui_text_start(msg_id)
                            text_started = True
                        yield ui_text_delta(chunk.text, id=msg_id)
                        model_parts.append(types.Part.from_text(text=chunk.text))
                    if chunk.function_calls:
                        for call in chunk.function_calls:
                            tool_name = call.name
                            args = call.args
                            tool_call_id = "call_" + str(hash(tool_name + str(args)))
                            
                            model_parts.append(types.Part.from_function_call(name=tool_name, args=args))
                            tool_calls_made.append((tool_call_id, tool_name, args))
                            
                            yield ui_tool_input_available(tool_call_id, tool_name, args)
                
                if text_started:
                    yield ui_text_end(msg_id)
                    
                if model_parts:
                    # Compact model parts into contents
                    if contents and contents[-1].role == "model":
                        contents[-1].parts.extend(model_parts)
                    else:
                        contents.append(types.Content(role="model", parts=model_parts))
                
                if not tool_calls_made:
                    # Model returned text only, we are done
                    break
                    
                user_tool_parts = []
                requires_approval = False
                
                for tool_call_id, tool_name, args in tool_calls_made:
                    if tool_name == "booking":
                        yield ui_tool_approval_request(tool_call_id, f"{tool_call_id}_approval")
                        requires_approval = True
                    else:
                        yield ui_data_trace(tool_call_id, tool_name, f"Executing {tool_name}...", "running")
                        if tool_name == "resume_search":
                            res = execute_resume_search(args.get("query", ""))
                        elif tool_name == "git_hub_query":
                            res = execute_github_query(args.get("project", ""))
                        elif tool_name == "mphil_research":
                            res = execute_mphil_research(args.get("question", ""))
                        elif tool_name == "behavioral_question_retrieve":
                            res = execute_behavioral_search(args.get("query", ""))
                        elif tool_name == "lookup_booking":
                            res = execute_lookup_booking(args.get("email"), args.get("phone"))
                        else:
                            res = {"error": "Unknown tool"}
                        
                        yield ui_data_trace(tool_call_id, tool_name, "Done", "done")
                        yield ui_tool_output_available(tool_call_id, res)
                        user_tool_parts.append(types.Part.from_function_response(name=tool_name, response=res))
                
                if requires_approval:
                    # Stop the loop, wait for user to approve via next API request
                    break
                    
                if user_tool_parts:
                    if contents and contents[-1].role == "user":
                        contents[-1].parts.extend(user_tool_parts)
                    else:
                        contents.append(types.Content(role="user", parts=user_tool_parts))
                
                # Loop continues and calls generate_content_stream again with updated contents
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            err_msg = str(e)
            if '429' in err_msg or 'quota' in err_msg.lower():
                yield ui_text_start("msg_error_fallback")
                yield ui_text_delta("I've reached my quota limit for the moment. Would you like to schedule a coffee chat to discuss this instead?")
                yield ui_text_end("msg_error_fallback")
            else:
                yield ui_text_start("msg_error_fallback")
                yield ui_text_delta("I'm having a little trouble connecting to my knowledge base. Would you like to schedule a coffee chat to discuss this instead?")
                yield ui_text_end("msg_error_fallback")
                
        yield ui_finish("stop")
        
        background_tasks.add_task(log_chat_session, session_id, contents)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/api/chat")
async def chat_endpoint(request: Request, background_tasks: BackgroundTasks):
    return await chat_stream(request, background_tasks)
