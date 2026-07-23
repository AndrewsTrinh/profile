import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from rag_lib import write_corpus

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

MD_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'behavioural_questions.md')
CORPUS_NAME = "behavioral"

def main():
    print(f"Reading {MD_PATH}...")
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        raw = f.read()

    # Split by '---'
    sections = raw.split("---")
    
    # We want to ignore the first section (the header/intro) and just take the actual questions.
    # Actually, let's just chunk it and let the RAG figure it out, or we can just filter out tiny chunks.
    chunks = []
    for s in sections:
        clean_s = s.strip()
        if len(clean_s) > 100:
            chunks.append(clean_s)

    print(f"Extracted {len(raw)} chars -> {len(chunks)} chunks.")

    write_corpus(CORPUS_NAME, chunks)
    print(f"Wrote {len(chunks)} chunks -> corpus_chunks (corpus='{CORPUS_NAME}') in Neon")

if __name__ == "__main__":
    main()
