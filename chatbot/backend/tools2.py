import os
import sys
from typing import Dict, Any

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from rag_lib import load_corpus, retrieve_top_k
from bookings_lib import find_bookings

CORPUS_NAME = "mphil"
CORPUS = load_corpus(CORPUS_NAME)

RESUME_CORPUS_NAME = "resume"
RESUME_CORPUS = load_corpus(RESUME_CORPUS_NAME)
BEHAVIORAL_CORPUS_NAME = "behavioral"
BEHAVIORAL_CORPUS = load_corpus(BEHAVIORAL_CORPUS_NAME)

def execute_mphil_research(query: str) -> Dict[str, Any]:
    if not CORPUS:
        return {"passages": [], "error": "The MPhil proposal corpus has not been generated yet."}

    return {"passages": retrieve_top_k(query, CORPUS, k=4)}


def execute_resume_search(query: str) -> Dict[str, Any]:
    if not RESUME_CORPUS:
        return {"passages": [], "error": "The resume corpus has not been generated yet."}

    return {"passages": retrieve_top_k(query, RESUME_CORPUS, k=4)}


def execute_lookup_booking(email: str = None, phone: str = None) -> Dict[str, Any]:
    if not email and not phone:
        return {"bookings": [], "error": "Provide an email or phone number to look up a booking."}

    bookings = find_bookings(email=email, phone=phone)
    return {"bookings": [b.model_dump(mode="json") for b in bookings]}


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

BEHAVIORAL_MIN_COSINE = 0.645

def execute_behavioral_search(query: str) -> Dict[str, Any]:
    if not BEHAVIORAL_CORPUS:
        return {"passages": [], "error": "The behavioral corpus has not been generated yet."}
    
    passages = retrieve_top_k(query, BEHAVIORAL_CORPUS, k=2)
    
    if passages and passages[0].get("cosine_sim", 0) < BEHAVIORAL_MIN_COSINE:
        return {"passages": [], "message": "nothing relevant"}
        
    return {"passages": passages}
