# Andrew's Resume Chatbot

A first-person AI persona chatbot for Andrew Trinh — answers as "Andrew", grounded entirely in
tool calls (no free-standing claims), with a visible trace of which tool ran and what it
retrieved for every reply. Next.js App Router + AI SDK v6 + Vercel AI Gateway (Gemini 2.5 Flash,
falling back to Grok), styled with the Catppuccin Mocha/Latte palette.

It shares resume content with the sibling `web/` dashboard: `src/lib/resume-data.ts` re-exports
`../../web/src/data/resume.ts` directly, so editing that one file keeps both the dashboard and
this bot in sync — never duplicate resume content here.

## Tools

| Tool | What it does | Mechanism |
|---|---|---|
| `resume_search` | Answers questions about experience, projects, skills, education | Hybrid RAG (Semantic `pgvector` + `rank_bm25`) over Neon Postgres |
| `mphil_research` | Answers questions about the MPhil proposal | Hybrid RAG (Semantic `pgvector` + `rank_bm25`) over Neon Postgres |
| `behavioral_question_retrieve` | Retrieves pre-drafted STAR stories for behavioral questions | Hybrid RAG (Semantic `pgvector` + `rank_bm25`) over Neon Postgres |
| `git_hub_query` | Answers "what is this project" for linked repos | Live GitHub REST API call |
| `booking` | Saves coffee chat details to the database | Neon Postgres (`bookings` table), gated by an explicit UI confirmation |
| `lookup_booking` | Retrieves details about an existing booking | Neon Postgres |

## Setup

```bash
cd chatbot
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### 1. Database & Hybrid RAG Corpora (Neon Postgres)

The chatbot uses a Neon Postgres database for Hybrid RAG search, coffee chat bookings, and session logging.

1. Set `NEON_CONNECTION_STRING` (or `DATABASE_URL`) locally in `.env.local`, and in the Vercel project for production.
2. Run `scripts/init-neon-schema.sql` once against the database to create the required tables (`corpus_chunks`, `bookings`, `chat_logs`) and indexes.
3. Apply the `scripts/hybrid_migration.sql` and `scripts/hybrid_migration2.sql` to enable the `pgvector` extension and add the `embedding vector(3072)` column.
4. Run the data ingestion scripts to chunk and embed the source material into Postgres using `gemini-embedding-2`:
   ```bash
   python scripts/build_resume_corpus.py
   python scripts/build_mphil_corpus.py
   python scripts/build_behavioral_corpus.py
   ```

### 2. AI Gateway & API Keys

Enable AI Gateway on the linked Vercel project, then either `vercel env pull .env.local`
(provisions `VERCEL_OIDC_TOKEN`) or set `AI_GATEWAY_API_KEY` manually for local dev.

You also must provide a `GOOGLE_API_KEY` for the underlying `google-genai` SDK used by the FastAPI backend to synthesize responses and embed the corpora.

### 3. GitHub token (optional but recommended)

`GITHUB_TOKEN` (a fine-grained PAT with public-repo read access) raises `git_hub_query`'s GitHub API rate limit from 60/hr to 5,000/hr.

## Guardrails summary

- **Gibberish Blocker**: User messages are validated by a lightning-fast zero-shot prompt before execution. Complete gibberish or wildly irrelevant questions are instantly rejected, saving tokens and database reads.
- **Booking Confirmation**: Booking requires an explicit visitor confirmation via a custom UI Card. The AI is explicitly instructed to execute the tool immediately upon collecting details, rather than asking conversational confirmation questions.
- **Fallback**: If the user asks an out-of-scope question or the RAG tools return empty passages, the AI is instructed to not hallucinate, but rather pivot into offering a coffee chat.

## Deploying

Vercel deployment is driven by the custom `vercel.json` file located at the **repository root**, not inside the `chatbot/` folder. This ensures Vercel successfully bundles both the `chatbot/` code and the shared data imports from the `web/` directory.

To deploy manually:
```bash
# Run this from the REPOSITORY ROOT, not inside chatbot/
npx vercel --prod
```
