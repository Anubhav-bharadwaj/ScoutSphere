import json
from groq import Groq
from backend.core.config import settings

def extract_opportunity(markdown: str) -> dict | None:
    """Extract structured opportunity data from markdown using Groq."""
    if not settings.GROQ_API_KEY:
        print("Groq API Key not set.")
        return None
        
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    Extract the following details from the text below. 
    Return a valid JSON object with keys: 
    - "title" (string)
    - "description" (string)
    - "deadline" (ISO8601 string or null)
    - "requirements" (object with key-value pairs of requirements)
    
    If no opportunity is found, return empty strings or null.
    
    Text:
    {markdown[:8000]} # Limit to 8000 chars to avoid token limits for now
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts structured JSON data. Output ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        content = chat_completion.choices[0].message.content
        if content:
            return json.loads(content)
        return None
    except Exception as e:
        print(f"Evaluator error: {e}")
        return None
