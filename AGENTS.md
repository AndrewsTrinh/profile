# Agent Instructions

This repository has three largely independent parts: LaTeX documents, a React web dashboard, and a Next.js chatbot.

## Web Dashboard (`web/`)
- **Directory**: Always use `web/` as the working directory for Node/npm commands. The root has no `package.json`.
- **Single Source of Truth**: `web/src/data/resume.ts` drives the web app. It is manually transcribed from `resume_andrew_trinh.tex`. When the LaTeX resume changes, you must manually update `resume.ts` to match.
- **Generated Code**: Never manually edit `web/src/data/skills.generated.json`. It is generated from `resume.ts`. To regenerate it, run `npm run extract` inside `web/` (this also happens automatically during `npm run build`).
- **Commands**: Run `npm run typecheck` and `npm run build` to verify changes.

## Chatbot (`chatbot/`)
- **Directory**: Always use `chatbot/` as the working directory for Node/npm commands.
- **Shared Content**: `chatbot/src/lib/resume-data.ts` re-exports `../../web/src/data/resume.ts`. Never duplicate resume content in `chatbot/` — edit the `web/` source of truth instead.
- **Backend API & Database**: The Next.js app proxies `/api/*` requests to a Python FastAPI backend (`chatbot/backend/`), deployed via Vercel Serverless Functions (`api/index.py`). The backend requires a Neon Postgres database (`NEON_CONNECTION_STRING`) with the `pgvector` extension enabled to store Hybrid RAG corpora (`corpus_chunks`), coffee chat bookings (`bookings`), and asynchronous chat session summaries (`chat_logs`).
- **Corpora Scripts**: The static local JSON RAG corpora have been replaced by a Postgres-backed Hybrid Search (Semantic + BM25). You must run the Python ingestion scripts (`scripts/build_resume_corpus.py`, `scripts/build_mphil_corpus.py`, `scripts/build_behavioral_corpus.py`) to chunk and embed data into Neon. Do not use the outdated `npm run corpus` script.
- **Vercel Deployment**: The deployment is driven by the custom `vercel.json` located at the *repository root*, not inside the `chatbot/` folder. Running Vercel directly inside `chatbot/` will break relative imports to the shared `web/` data.
- **Commands**: Run `npm run lint` and `npm run build` to verify changes.

## LaTeX Documents (Root & `cover_letters/`)
- **Build Command**: Use `latexmk -pdf <filename>.tex`.
- **Working Directory**: Always run `latexmk` from the directory containing the target `.tex` file (root for resumes, `cover_letters/` for cover letters). Building from the wrong directory will break relative paths to packages and images.
- **Committed Artifacts**: The generated `.pdf` and all build artifacts (e.g., `.aux`, `.log`, `.fdb_latexmk`) are explicitly tracked in Git. **Do not** delete or ignore build artifacts.
- **No Shared Includes**: Tailored resume variants (e.g., `resume_andrew_trinh_<variant>.tex`) must remain entirely standalone. Do not attempt to DRY them out or refactor them into shared includes. To create a new variant, simply copy the canonical file and edit it.

## Python Scripts (`scripts/`)
- Asset generation scripts must be run from the repository root (e.g., `python scripts/download_logos.py`).
