import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.core.database import get_db
from backend.core.config import settings
from backend.models.user import User
from backend.models.profile import Profile
from backend.core.parser import extract_text_from_pdf, extract_dummy_skills
from backend.core.vectorstore import vector_store
from backend.api.deps import get_current_user
from groq import AsyncGroq

router = APIRouter()
groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

@router.put("/me/profile", status_code=status.HTTP_200_OK)
async def update_profile(
    resume: UploadFile = File(...),
    preferences: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not resume.filename or not resume.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        preferences_data = json.loads(preferences)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid preferences JSON.")

    # Ensure storage dir exists
    storage_dir = Path(settings.RESUME_STORAGE_DIR)
    storage_dir.mkdir(parents=True, exist_ok=True)
    
    file_bytes = await resume.read()
    
    # Save file
    file_path = storage_dir / f"{current_user.id}_{uuid.uuid4().hex}_{resume.filename}"
    with open(file_path, "wb") as f:
        f.write(file_bytes)
        
    # Extract text and skills
    try:
        text = extract_text_from_pdf(file_bytes)
        skills = extract_dummy_skills(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")
        
    # Upsert Profile
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if profile:
        profile.resume_url = str(file_path)
        profile.resume_filename = resume.filename
        profile.resume_version += 1
        profile.skills = skills
        profile.preferences_json = preferences_data
        profile.resume_parse_status = "PARSED"
        profile.resume_text = text
    else:
        profile = Profile(
            user_id=current_user.id,
            resume_url=str(file_path),
            resume_filename=resume.filename,
            resume_version=1,
            skills=skills,
            preferences_json=preferences_data,
            resume_parse_status="PARSED",
            resume_text=text
        )
        db.add(profile)
        
    await db.commit()
    await db.refresh(profile)
    
    # Trigger vector sync
    try:
        # In a real app this would be a background task (e.g. Celery)
        vector_store.vectorize_and_store_profile(str(current_user.id), skills)
        profile.vector_sync_status = "SYNCED"
        await db.commit()
    except Exception:
        profile.vector_sync_status = "FAILED"
        await db.commit()
    
    return {"status": "success", "message": "Profile updated successfully"}

@router.get("/me/resume-analysis")
async def analyze_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if not profile or not profile.resume_text:
        raise HTTPException(status_code=400, detail="No resume uploaded")
        
    if not groq_client:
        return {
            "score": 75,
            "feedback": "Groq API key not configured. This is a mock analysis.",
            "improvements": ["Add more keywords", "Quantify your achievements"]
        }
        
    prompt = (
        "You are an expert ATS (Applicant Tracking System) simulator and resume reviewer. "
        "Analyze the following resume text and provide an ATS-compatibility evaluation. "
        "Return a JSON object strictly conforming to this structure: "
        "{ 'score': integer (0-100), 'feedback': string (overall thoughts), 'improvements': list of strings (actionable advice) }. "
        f"Resume text:\n{profile.resume_text}"
    )
    
    try:
        response = await groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        content = response.choices[0].message.content
        if content:
            return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {e}")
        
    return {"score": 50, "feedback": "Failed to parse analysis", "improvements": []}
