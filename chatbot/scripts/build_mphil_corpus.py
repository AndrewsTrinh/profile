import os
import sys
from dotenv import load_dotenv
from PyPDF2 import PdfReader

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from rag_lib import chunk_text, write_corpus

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# NOTE: reads from a separate local repo, not part of this repo or the sibling
# `profile/` repo — machine-specific path, will break if mphil_research moves.
PDF_PATH = '/Users/andrew/mphil_research/main.pdf'
CORPUS_NAME = "mphil"

def main():
    print(f"Reading {PDF_PATH}...")
    reader = PdfReader(PDF_PATH)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    chunks = chunk_text(text)
    print(f"Extracted {len(text)} chars -> {len(chunks)} chunks.")

    write_corpus(CORPUS_NAME, chunks)
    print(f"Wrote {len(chunks)} chunks -> corpus_chunks (corpus='{CORPUS_NAME}') in Neon")

if __name__ == "__main__":
    main()
