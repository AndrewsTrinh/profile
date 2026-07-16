import os
import json
import urllib.request
from PyPDF2 import PdfReader
from io import BytesIO
from google import genai
import math

PDF_URL = 'https://raw.githubusercontent.com/AndrewsTrinh/mphil_research/main/main.pdf'
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'mphil-corpus.json')
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

def chunk_text(text: str) -> list[str]:
    clean = " ".join(text.split())
    chunks = []
    start = 0
    while start < len(clean):
        end = min(start + CHUNK_SIZE, len(clean))
        chunks.append(clean[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c for c in chunks if len(c) > 40]

def main():
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("Warning: GOOGLE_API_KEY not set. Generating corpus requires it.")
        return

    print(f"Fetching {PDF_URL}...")
    req = urllib.request.Request(PDF_URL)
    with urllib.request.urlopen(req) as response:
        pdf_bytes = response.read()

    reader = PdfReader(BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    chunks = chunk_text(text)
    print(f"Extracted {len(text)} chars -> {len(chunks)} chunks. Embedding...")

    client = genai.Client()
    
    # We embed chunks in batches to avoid rate limits if necessary, though 
    # google-genai client handles a list of contents.
    corpus = []
    
    # Process each chunk (or batch if the API supports it, here we do one by one for simplicity)
    response = client.models.embed_content(
        model='text-embedding-004',
        contents=chunks
    )
    
    embeddings = [emb.values for emb in response.embeddings]

    for i, chunk in enumerate(chunks):
        corpus.append({"text": chunk, "embedding": embeddings[i]})

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(corpus, f)
    
    print(f"Wrote {len(corpus)} chunks -> {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
