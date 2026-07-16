import os
import json
import numpy as np
from google import genai
from typing import List, Dict, Any

CORPUS_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'mphil-corpus.json')
try:
    with open(CORPUS_PATH, 'r') as f:
        CORPUS = json.load(f)
except Exception:
    CORPUS = []

def cosine_similarity(a: List[float], b: List[float]) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def execute_mphil_research(query: str) -> Dict[str, Any]:
    if not CORPUS:
        return {"passages": [], "error": "The MPhil proposal corpus has not been generated yet."}
    
    # Needs GOOGLE_API_KEY env var
    client = genai.Client()
    response = client.models.embed_content(
        model='text-embedding-004',
        contents=query
    )
    query_embedding = response.embeddings[0].values
    
    ranked = []
    for chunk in CORPUS:
        score = cosine_similarity(query_embedding, chunk['embedding'])
        ranked.append({"text": chunk['text'], "score": score})
        
    ranked.sort(key=lambda x: x['score'], reverse=True)
    top_k = ranked[:4]
    
    return {"passages": [{"text": r['text'], "relevance": r['score']} for r in top_k]}

import httpx

def execute_github_query(project: str) -> Dict[str, Any]:
    # Simplified version, in real life we fetch from GitHub API using httpx
    # mapping projects to repos
    projects = {
        "typology-extractor": "AndrewsTrinh/aml_llm",
        "phechat": "lf2foce/phechat-agent",
        "graph-analytics-vn": "AndrewsTrinh/graph_cross_owner_public_equity_vn"
    }
    repo = projects.get(project.lower())
    if not repo:
        return {"error": f"'{project}' doesn't match a project with a GitHub link.", "availableProjects": list(projects.keys())}
    
    token = os.environ.get("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "andrew-portfolio"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    try:
        res = httpx.get(f"https://api.github.com/repos/{repo}", headers=headers, timeout=10)
        repo_data = res.json() if res.status_code == 200 else {}
        
        # Also try to get README
        readme_res = httpx.get(f"https://raw.githubusercontent.com/{repo}/main/README.md", timeout=10)
        readme = readme_res.text if readme_res.status_code == 200 else None
        
        return {
            "description": repo_data.get("description"),
            "stars": repo_data.get("stargazers_count"),
            "readme": readme
        }
    except Exception as e:
        return {"error": str(e)}
