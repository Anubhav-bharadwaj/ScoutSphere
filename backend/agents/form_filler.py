import json
import logging
from groq import Groq
from pydantic import BaseModel
from backend.core.config import settings
from backend.models.profile import Profile
from backend.models.opportunity import Opportunity

logger = logging.getLogger(__name__)

class FormPayloadResponse(BaseModel):
    first_name: str
    last_name: str
    email: str
    questionnaire_answer: str

def generate_form_payload(profile: Profile, opportunity: Opportunity, user_email: str, user_name: str | None = None) -> dict:
    """
    Uses Groq to generate form fields based on the user's profile and the target opportunity.
    """
    if not settings.GROQ_API_KEY:
        logger.error("GROQ_API_KEY is not set.")
        # Fallback to a basic template if no API key is provided
        return {
            "first_name": "Test",
            "last_name": "User",
            "email": user_email,
            "questionnaire_answer": f"I am very interested in the {opportunity.title} role at {opportunity.company}."
        }

    client = Groq(api_key=settings.GROQ_API_KEY)

    # Use basic info if name is missing
    first_name = "Alex"
    last_name = "Mercer"
    if user_name:
        parts = user_name.split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

    system_prompt = (
        "You are an expert AI Form-Filler assistant. "
        "Your task is to populate standard job application form fields based on a user's profile and the target role. "
        "Extract the user's first name, last name, and email from the provided context. "
        "Draft a compelling 2-3 sentence answer to the question 'Why do you want to work here?' that highlights their specific skills mapping to the role's requirements. "
        "You MUST return the result strictly as a JSON object with the following exact keys:\n"
        '- "first_name": string\n'
        '- "last_name": string\n'
        '- "email": string\n'
        '- "questionnaire_answer": string\n'
    )

    user_prompt = f"""
    Target Opportunity:
    Title: {opportunity.title}
    Company: {opportunity.company}
    Requirements: {json.dumps(opportunity.requirements or {})}
    
    User Context:
    Email: {user_email}
    Name Context: {first_name} {last_name}
    Skills: {json.dumps(profile.skills or [])}
    Education: {json.dumps(profile.education or {})}
    Preferences: {json.dumps(profile.preferences_json or {})}
    """

    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        
        content = response.choices[0].message.content
        if content:
            return json.loads(content)
            
    except Exception as e:
        logger.error(f"Error generating form payload with Groq: {e}")
        
    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": user_email,
        "questionnaire_answer": f"I am very interested in the {opportunity.title} role at {opportunity.company}. My skills in {', '.join((profile.skills or [])[:3])} make me a great fit."
    }
