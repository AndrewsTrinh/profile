# Andrew's Resume Chatbot

A first-person AI persona chatbot for Andrew Trinh — answers as "Andrew", grounded entirely in
tool calls (no free-standing claims), with a visible trace of which tool ran and what it
retrieved for every reply. Next.js App Router + AI SDK v6 + Vercel AI Gateway (Gemini 3.5 Flash,
falling back to Grok), styled with the Catppuccin Mocha/Latte palette.

It shares resume content with the sibling `web/` dashboard: `src/lib/resume-data.ts` re-exports
`../../web/src/data/resume.ts` directly, so editing that one file keeps both the dashboard and
this bot in sync — never duplicate resume content here.

## Tools

| Tool | What it does | Mechanism |
|---|---|---|
| `skill_listing` | Lists skills + the achievements that demonstrate them | Structured lookup over `resume-data.ts` |
| `experience_listing` | Lists roles/achievements, filterable by org/topic | Structured lookup over `resume-data.ts` |
| `mphil_research` | Answers questions about the MPhil proposal | Real RAG — see [MPhil corpus](#mphil-corpus) |
| `git_hub_query` | Answers "what is this project" for linked repos | Live GitHub REST API call |
| `booking` | Books a real meeting on Andrew's calendar | Google Calendar API + Resend, gated by an explicit visitor confirmation (AI SDK `toolApproval`) |

## Setup

```bash
cd chatbot
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### 1. AI Gateway

Enable AI Gateway on the linked Vercel project, then either `vercel env pull .env.local`
(provisions `VERCEL_OIDC_TOKEN`) or set `AI_GATEWAY_API_KEY` manually for local dev.

### 2. MPhil corpus

The RAG tool reads a static, pre-embedded corpus (`src/data/mphil-corpus.json`) rather than
hitting a vector database at request time — the source is a single PDF that rarely changes.
Generate it once (and re-run whenever the proposal changes):

```bash
npx tsx scripts/build-mphil-corpus.ts
```

### 3. Google Calendar (booking tool)

The booking tool authorizes against **your own** Google Calendar via a refresh token — visitors
never see an OAuth flow. One-time setup:

1. In Google Cloud Console, create an OAuth client (type "Desktop app") with the Calendar API
   enabled, and note the client ID/secret.
2. Run the helper script, which opens a consent URL and prints a refresh token:
   ```bash
   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npx tsx scripts/get-google-refresh-token.ts
   ```
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and the printed `GOOGLE_REFRESH_TOKEN` as env
   vars (locally in `.env.local`, and in the Vercel project for production).

### 4. Resend (booking notification email)

Set `RESEND_API_KEY`. `RESEND_FROM` should be an address on a domain verified in Resend — without
one it falls back to Resend's sandbox sender, which only delivers to your own Resend account
email (fine for testing, not for production).

### 5. GitHub token (optional but recommended)

`GITHUB_TOKEN` (a fine-grained PAT with public-repo read access) raises `git_hub_query`'s GitHub
API rate limit from 60/hr to 5,000/hr.

### 6. Rate limiting (Upstash Redis)

Install via the Vercel Marketplace (`vercel integration add upstash`), which auto-provisions
`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`. Without these set, rate limiting is a no-op
(see `src/lib/ratelimit.ts`) — fine for local dev, **do not deploy to production without it**,
since the chat endpoint costs real money per message and the booking tool writes to a real
calendar.

### 7. Bot protection

[Vercel BotID](https://vercel.com/docs/botid) is wired via `withBotId()` in `next.config.ts`,
`initBotId()` in `src/instrumentation-client.ts`, and `checkBotId()` in the chat route. No setup
needed beyond deploying to Vercel.

## Guardrails summary

- Per-IP rate limit on the whole chat endpoint (~20 msg/hr) via `src/proxy.ts`.
- A tighter per-IP limit on booking specifically (~3/hr), checked in the route handler (booking
  isn't a separate endpoint — it's a tool-approval turn on `/api/chat`).
- Booking requires an explicit visitor confirmation via AI SDK `toolApproval` — a prompt-injected
  instruction can make the model *propose* a booking, but cannot approve it.
- BotID on the chat endpoint.

## Deploying

Create a new Vercel project pointed at this repo with **Root Directory set to `chatbot/`** —
keep it separate from the `web/` project, which deploys to GitHub Pages via its own workflow and
is unaffected by this app. Set all the env vars above in the Vercel project settings before the
first deploy.
