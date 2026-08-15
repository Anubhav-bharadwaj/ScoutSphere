import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.models.user import User
from backend.models.match import Match
from backend.models.opportunity import Opportunity
from backend.models.profile import Profile
from backend.core.config import settings
from pydantic import BaseModel
from datetime import datetime
from groq import AsyncGroq
import json
from fastapi import HTTPException

router = APIRouter()
groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

class OpportunityResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    source_url: str
    deadline: Optional[datetime]
    requirements: Optional[dict]
    created_at: datetime
    
    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: uuid.UUID
    score: float
    reason: Optional[str]
    strong_areas: Optional[list[str]] = None
    missing_skills: Optional[list[str]] = None
    created_at: datetime
    opportunity: OpportunityResponse
    
    class Config:
        from_attributes = True

@router.get("/matches", response_model=List[MatchResponse])
async def get_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    min_score: float = Query(0.0, ge=0.0, le=1.0),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated and filtered opportunities matched to the current user.
    """
    # MVP Hack: Fetch first user if no auth is provided
    result = await db.execute(select(User).order_by(User.created_at).limit(1))
    current_user = result.scalars().first()
    
    if not current_user:
        return []
    # Fetch matches for the user, ordered by score descending
    stmt = (
        select(Match)
        .options(selectinload(Match.opportunity))
        .where(Match.user_id == current_user.id)
        .where(Match.score >= min_score)
        .order_by(Match.score.desc(), Match.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    matches = result.scalars().all()
    
    return matches

class TailoredResumeResponse(BaseModel):
    markdown: str

@router.post("/{opportunity_id}/tailor-resume", response_model=TailoredResumeResponse)
async def tailor_resume(
    opportunity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a tailored resume in Markdown using Groq based on the user's raw resume and the target opportunity.
    """
    # MVP Hack: Fetch first user if no auth is provided
    result = await db.execute(select(User).order_by(User.created_at).limit(1))
    current_user = result.scalars().first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    # Get Profile
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if not profile or not profile.resume_text:
        raise HTTPException(status_code=400, detail="No resume uploaded or parsed text is missing.")
        
    # Get Opportunity
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opportunity = result.scalar_one_or_none()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    prompt = (
        "You are an expert technical recruiter and resume writer. "
        "Your task is to tailor the user's resume specifically for the target opportunity. "
        "Rewrite the resume in a clean, professional Markdown format. "
        "Highlight the skills and experiences from the original resume that best match the opportunity's requirements. "
        "Do NOT hallucinate or invent new jobs, degrees, or experiences that the user does not have. "
        "Output ONLY the final Markdown text. Do not include introductory conversational filler.\n\n"
        f"TARGET OPPORTUNITY:\n"
        f"Title: {opportunity.title}\n"
        f"Company: {opportunity.company}\n"
        f"Description: {opportunity.description}\n"
        f"Requirements: {json.dumps(opportunity.requirements or {})}\n\n"
        f"ORIGINAL RESUME TEXT:\n{profile.resume_text}"
    )
    
    try:
        response = await groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
        )
        content = response.choices[0].message.content
        markdown = content.strip() if content else ""
        return {"markdown": markdown}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate tailored resume: {str(e)}")

class CompanyIntelResponse(BaseModel):
    overview: str
    culture: str
    recent_news: list[str]
    salary_insights: str

@router.get("/{opportunity_id}/intel", response_model=CompanyIntelResponse)
async def get_company_intel(
    opportunity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate simulated company intelligence based on the opportunity details.
    """
    if not groq_client:
        return {
            "overview": "Groq not configured.",
            "culture": "Unknown.",
            "recent_news": [],
            "salary_insights": "Unknown."
        }
        
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opportunity = result.scalar_one_or_none()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    prompt = (
        "You are an expert corporate intelligence analyst. "
        "Based on the following job opportunity, generate a detailed company dossier. "
        "Return a JSON object with the following exact keys: "
        "'overview' (string: 2-3 sentences about what the company does), "
        "'culture' (string: 2-3 sentences estimating their work culture), "
        "'recent_news' (list of 3 strings: realistic simulated recent news headlines for this company), "
        "'salary_insights' (string: estimated salary range and benefits for this specific role). "
        f"Target Company: {opportunity.company}\n"
        f"Target Role: {opportunity.title}\n"
        f"Description: {opportunity.description}"
    )
    
    try:
        response = await groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.4,
        )
        content = response.choices[0].message.content
        if content:
            return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate intel: {e}")
        
    return {
        "overview": "Failed to parse intelligence data.",
        "culture": "N/A",
        "recent_news": [],
        "salary_insights": "N/A"
    }

