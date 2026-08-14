import io
from pypdf import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_dummy_skills(text: str) -> list[str]:
    """A naive skill extractor for Phase 1 MVP."""
    possible_skills = ["python", "react", "fastapi", "next.js", "postgresql", "docker", "typescript"]
    found_skills = []
    text_lower = text.lower()
    for skill in possible_skills:
        if skill in text_lower:
            found_skills.append(skill)
    return found_skills or ["Python", "React"] # Default fallback
