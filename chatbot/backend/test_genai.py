import os
import json
from google import genai
from google.genai import types

def execute_skill_listing(query: str = "") -> dict:
    """List Andrew's skills, optionally filtered by a search term."""
    return {"skills": [{"skill": "Python"}, {"skill": "SQL"}]}

def test_call():
    client = genai.Client(api_key=os.environ.get("AI_GATEWAY_API_KEY", "dummy")) # Just to see if types work
    
    config = types.GenerateContentConfig(
        tools=[execute_skill_listing],
        temperature=0.0
    )
    print("Config works!")

if __name__ == "__main__":
    test_call()
