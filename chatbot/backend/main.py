from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Shared with the Next.js frontend — GOOGLE_API_KEY and friends live in the
# one .env.local at the chatbot/ root, not a separate backend/ env file.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env.local'))

from router import router

app = FastAPI(title="Andrew Trinh AI Chatbot Backend")

# Allow Next.js frontend to communicate with this backend. Same-origin in
# production (frontend and this API are one Vercel deployment), but CORS still
# matters for local dev (localhost:3000 -> localhost:8000) and Vercel preview
# deployments, which each get their own *.vercel.app subdomain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://andrewstrinh.github.io"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
