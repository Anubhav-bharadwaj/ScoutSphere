from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from backend.core.database import get_db
from backend.core.config import settings
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.models.profile import Profile
from groq import AsyncGroq

router = APIRouter()
groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

class RoadmapRequest(BaseModel):
    target_role: str

class RoadmapResponse(BaseModel):
    markdown: str

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    req: RoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not groq_client:
        return {"markdown": "## Error\nGroq API key not configured. Mock response."}
        
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if not profile or not profile.resume_text:
        raise HTTPException(status_code=400, detail="No resume found to base the roadmap on.")
        
    prompt = (
        "You are an expert tech career coach. Based on the user's current resume and their target role, "
        "generate a detailed, step-by-step career roadmap in beautiful Markdown. "
        "Include: 1) Gap Analysis (what they are missing), 2) Recommended Courses/Certifications, 3) 3 Project Ideas to build, 4) Timeline. "
        f"Target Role: {req.target_role}\n"
        f"Resume Context: {profile.resume_text}"
    )
    
    try:
        response = await groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.4,
        )
        content = response.choices[0].message.content
        markdown = content.strip() if content else ""
        return {"markdown": markdown}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {e}")
