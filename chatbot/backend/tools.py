import json
import os
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Load pre-generated skills
try:
    with open(os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'src', 'data', 'skills.generated.json'), 'r') as f:
        SKILLS_DATA = json.load(f)
except Exception:
    SKILLS_DATA = []

# Experience Data (Static copy of resume timeline)
EXPERIENCE_DATA = [
  {
    "role": "Investment Associate",
    "org": "National Citizen Bank",
    "start": "2014-09",
    "end": "2018-02",
    "achievements": [
      "Secured Investment Council approval for 80% of recommendations, generating a public equity portfolio CAGR of 10%.",
      "Reduced investment-approval time by 72 hours and eliminated major process conflicts."
    ]
  },
  {
    "role": "Data Analyst",
    "org": "Remitano",
    "start": "2020-03",
    "end": "2021-04",
    "achievements": [
      "Automated email marketing via customer-classification models (Python/SQL), boosting CTR by 30%.",
      "Optimised ETL pipelines, indexing, and data normalisation in Redshift, slashing developer workload by 25%.",
      "Engineered complex SQL (incl. recursive queries) for MLM commission calculations across 150K+ relationships."
    ]
  },
  {
    "role": "Analyst — Intelligence & Analytics, Financial Crime Risk",
    "org": "Bendigo & Adelaide Bank",
    "start": "2021-05",
    "end": "present",
    "achievements": [
      "Decision Engineering: Built vector-search infrastructure and a real-time streaming UI powering an AUSTRAC Knowledge Hub.",
      "Led an interim fraud & AML transaction-monitoring function during DELPHI exit and TechOne transition.",
      "AI Enablement: Co-designed an end-to-end AI-driven UAR-to-SMR pipeline with secure data masking/rehydration.",
      "Developed and fine-tuned scenarios for Child Exploitation, Sextortion, Drug Trafficking using genetic algorithms.",
      "Agentic AI Framework: Engineered a typology extractor using Agentic AI and advanced ETL.",
      "Dashboard & Reporting: Built Power BI dashboards and monthly reporting used by Operations."
    ]
  }
]

class SkillListingArgs(BaseModel):
    query: Optional[str] = Field(None, description='Optional free-text filter, e.g. a skill name or a topic like "machine learning". Omit to list all skills.')

class ExperienceListingArgs(BaseModel):
    query: Optional[str] = Field(None, description='Optional free-text filter for roles, companies, or specific types of achievements.')

class GitHubQueryArgs(BaseModel):
    project: str = Field(description='The name or ID of the project to look up (e.g., "typology-extractor", "phechat").')

class BookingArgs(BaseModel):
    visitorName: str = Field(description="The visitor's name.")
    visitorEmail: str = Field(description="The visitor's email address.")
    startISO: str = Field(description="The requested meeting start time in ISO 8601 format.")
    durationMinutes: int = Field(description="The requested meeting duration in minutes.", default=30)
    note: Optional[str] = Field(None, description="An optional note from the visitor.")

class MphilResearchArgs(BaseModel):
    question: str = Field(description="The visitor's question about the MPhil research proposal.")

def execute_skill_listing(args: SkillListingArgs) -> Dict[str, Any]:
    needle = args.query.strip().lower() if args.query else None
    
    if needle:
        matched = [
            s for s in SKILLS_DATA 
            if needle in s['skill'].lower() or needle in s['id'].lower()
        ]
    else:
        matched = SKILLS_DATA
        
    return {"skills": matched}

def execute_experience_listing(args: ExperienceListingArgs) -> Dict[str, Any]:
    needle = args.query.strip().lower() if args.query else None
    
    if needle:
        matched = []
        for exp in EXPERIENCE_DATA:
            if (needle in exp['role'].lower() or 
                needle in exp['org'].lower() or 
                any(needle in a.lower() for a in exp['achievements'])):
                matched.append(exp)
    else:
        matched = EXPERIENCE_DATA
        
    return {"experience": matched}
