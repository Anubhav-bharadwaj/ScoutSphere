import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.models.user import User
from backend.models.match import Match
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

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
    result = await db.execute(select(User).limit(1))
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
