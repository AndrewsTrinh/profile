import os
import re
from datetime import datetime
import psycopg2
from pydantic import BaseModel
from rank_bm25 import BM25Okapi
from google import genai


class CorpusChunk(BaseModel):
    id: int | None = None
    corpus: str
    text: str
    chunk_index: int
    created_at: datetime | None = None


def get_connection():
    dsn = os.environ.get("NEON_CONNECTION_STRING") or os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError("NEON_CONNECTION_STRING (or DATABASE_URL) is not set.")
    return psycopg2.connect(dsn)


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 150) -> list[str]:
    clean = " ".join(text.split())
    chunks = []
    start = 0
    while start < len(clean):
        end = min(start + chunk_size, len(clean))
        chunks.append(clean[start:end])
        start += chunk_size - chunk_overlap
    return [c for c in chunks if len(c) > 40]


def load_corpus(corpus_name: str) -> list[CorpusChunk]:
    try:
        with get_connection() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT id, corpus, text, chunk_index, created_at FROM corpus_chunks "
                "WHERE corpus = %s ORDER BY chunk_index",
                (corpus_name,),
            )
            rows = cur.fetchall()
    except Exception:
        return []
    return [
        CorpusChunk(id=r[0], corpus=r[1], text=r[2], chunk_index=r[3], created_at=r[4])
        for r in rows
    ]


def write_corpus(corpus_name: str, chunks: list[str]) -> None:
    client = genai.Client()
    
    embeddings = []
    print(f"Embedding {len(chunks)} chunks using gemini-embedding-2...")
    
    for i, c in enumerate(chunks):
        try:
            res = client.models.embed_content(
                model='gemini-embedding-2',
                contents=c
            )
            embeddings.append(res.embeddings[0].values)
            print(f"Embedded chunk {i+1}/{len(chunks)}")
        except Exception as e:
            print(f"Error embedding chunk {i+1}: {e}")
            raise e
            
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM corpus_chunks WHERE corpus = %s", (corpus_name,))
        
        data = []
        for i, c in enumerate(chunks):
            emb_str = f"[{','.join(str(x) for x in embeddings[i])}]"
            data.append((corpus_name, c, i, emb_str))
            
        cur.executemany(
            "INSERT INTO corpus_chunks (corpus, text, chunk_index, embedding) VALUES (%s, %s, %s, %s)",
            data,
        )
        conn.commit()


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\w+", text.lower())


def retrieve_top_k(query: str, corpus: list[CorpusChunk], k: int = 4) -> list[dict]:
    if not corpus:
        return []
        
    client = genai.Client()
    try:
        res = client.models.embed_content(
            model='gemini-embedding-2',
            contents=query
        )
        query_emb = res.embeddings[0].values
    except Exception as e:
        print(f"Failed to embed query: {e}")
        query_emb = None

    tokenized_corpus = [_tokenize(c.text) for c in corpus]
    bm25 = BM25Okapi(tokenized_corpus)
    bm25_scores = bm25.get_scores(_tokenize(query))
    
    if not query_emb:
        ranked = sorted(zip(corpus, bm25_scores), key=lambda x: x[1], reverse=True)
        return [{"text": c.text, "relevance": float(s)} for c, s in ranked[:k]]

    vector_scores = {}
    corpus_name = corpus[0].corpus
    with get_connection() as conn, conn.cursor() as cur:
        emb_str = f"[{','.join(str(x) for x in query_emb)}]"
        cur.execute(
            "SELECT id, 1 - (embedding <=> %s) AS cosine_sim FROM corpus_chunks WHERE corpus = %s",
            (emb_str, corpus_name)
        )
        for row in cur.fetchall():
            vector_scores[row[0]] = row[1]
            
    bm25_ranked = sorted(zip(corpus, bm25_scores), key=lambda x: x[1], reverse=True)
    bm25_ranks = {item[0].id: rank + 1 for rank, item in enumerate(bm25_ranked)}
    
    vector_ranked = sorted(corpus, key=lambda c: vector_scores.get(c.id, 0), reverse=True)
    vector_ranks = {c.id: rank + 1 for rank, c in enumerate(vector_ranked)}
    
    RRF_K = 60
    final_scores = []
    
    for c in corpus:
        bm25_rank = bm25_ranks.get(c.id, len(corpus))
        vec_rank = vector_ranks.get(c.id, len(corpus))
        rrf_score = (1.0 / (RRF_K + bm25_rank)) + (1.0 / (RRF_K + vec_rank))
        final_scores.append((c, rrf_score))
        
    final_ranked = sorted(final_scores, key=lambda x: x[1], reverse=True)
    
    return [{"text": c.text, "relevance": float(s), "cosine_sim": float(vector_scores.get(c.id, 0))} for c, s in final_ranked[:k]]
