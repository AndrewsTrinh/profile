# Migration Plan: Switch from Vercel AI SDK to Python Backend (Google GenAI, Vertex AI, Ollama)

## Overview
This plan outlines the architecture and steps required to migrate the chatbot backend from the Next.js/Vercel AI SDK stack to a standalone Python backend (FastAPI). The new backend will implement a fallback chain across three LLM providers (Google GenAI, Vertex AI, and local Ollama) using `gemini-1.5-flash` and a local Ollama model.

## Phase 1: Python Backend Foundation
1. **Directory Structure**: Create a `backend/` directory in the project root.
2. **Environment Setup**: Initialize a Python virtual environment (`venv`) and a `requirements.txt`.
   - Key dependencies: `fastapi`, `uvicorn`, `google-genai`, `google-cloud-aiplatform`, `ollama`, `httpx`, `pydantic`.
3. **Stream Protocol Implementation**: Since the frontend uses Vercel `@ai-sdk/react`, the Python backend must format its streaming responses using the [Vercel AI SDK Data Stream Protocol](https://sdk.vercel.ai/docs/reference/stream-protocol/data-stream).
   - `0:"text chunk"` (Text)
   - `9:{"toolCallId":"...", "toolName":"...", "args":{...}}` (Tool Call)
   - `a:[{"toolCallId":"...","result":{...}}]` (Tool Result)

## Phase 2: Orchestration & Fallback Chain
1. **Fallback Router**: Create a core LLM router in Python.
   - **Primary**: `google-genai` (Model: `gemini-1.5-flash`).
   - **Fallback 1**: `google-cloud-aiplatform` (Vertex AI, Model: `gemini-1.5-flash`).
   - **Fallback 2**: `ollama` (Local Model, e.g., `llama3`).
2. **Endpoint**: Implement a FastAPI POST endpoint at `/api/chat` that accepts the JSON payload from the Next.js frontend (`{"messages": [...]}`).
3. **System Prompt**: Migrate `SYSTEM_PROMPT` from `src/lib/persona.ts` into the Python backend.

## Phase 3: Tool Migration
Migrate all tools from TypeScript (`src/lib/tools/*`) to Python.
1. **Schema Definition**: Define JSON schemas (via Pydantic) for each tool so the LLM can invoke them.
2. **Implementations**:
   - `skill_listing` / `experience_listing`: Port the static data filtering logic.
   - `git_hub_query`: Port the `httpx` logic to query the GitHub API.
   - `booking`: Port the Google Calendar API integration and Resend email logic.
3. **Approval Flow**: The Python backend must pause execution when the LLM requests the `booking` tool, returning the tool call to the frontend and waiting for a subsequent request containing the user approval.

## Phase 4: Embeddings & RAG
1. **Corpus Script**: Rewrite `scripts/build-mphil-corpus.ts` as `scripts/build_mphil_corpus.py`.
   - Use `google-genai` embedding models (e.g., `text-embedding-004`).
   - Read the PDF, chunk it, embed it, and save to a JSON file (`src/data/mphil-corpus.json`).
2. **MPhil Research Tool**: Implement the `mphil_research` tool in Python to query the embedded corpus using Cosine Similarity, leveraging Google GenAI for embedding the user query.

## Phase 5: Frontend Integration & Cleanup
1. **Next.js API Route**: Modify `src/components/chat/Chat.tsx` to point the `DefaultChatTransport` API route to the local Python backend (e.g., `http://127.0.0.1:8000/api/chat`).
2. **Cleanup**: 
   - Delete `src/app/api/chat/route.ts`.
   - Remove unused Vercel AI SDK Node dependencies (`ai`, `@ai-sdk/react` remains).
   - Update environment variables (remove `AI_GATEWAY_API_KEY`, ensure `GOOGLE_API_KEY` and Vertex credentials are set).
