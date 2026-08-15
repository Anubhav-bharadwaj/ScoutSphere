from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.core.database import get_db
from backend.models.user import User
from backend.models.application import Application
from backend.models.profile import Profile
from pydantic import BaseModel

router = APIRouter()

class WeeklyActivity(BaseModel):
    name: str
    applications: int

class AnalyticsResponse(BaseModel):
    total_applications: int
    status_counts: dict[str, int]
    weekly_activity: list[WeeklyActivity]
    ats_score_estimate: int

@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    db: AsyncSession = Depends(get_db)
):
    # MVP Hack: Fetch first user if no auth is provided
    result = await db.execute(select(User).order_by(User.created_at).limit(1))
    current_user = result.scalars().first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    # Get Application Stats
    result = await db.execute(
        select(Application.kanban_stage, func.count(Application.id))
        .where(Application.user_id == current_user.id)
        .group_by(Application.kanban_stage)
    )
    status_counts_raw = result.all()
    status_counts = {str(row[0]): int(row[1]) for row in status_counts_raw}
    
    total_applications = sum(status_counts.values())
    
    # Get Profile ATS Score (mocked here, ideally stored in DB after F2)
    ats_score = 85
    
    # Mock Weekly Activity for MVP since we don't have historical application timestamp grouping easily in sqlite/postgres without complex queries
    weekly_activity = [
        {"name": "Week 1", "applications": 2},
        {"name": "Week 2", "applications": 5},
        {"name": "Week 3", "applications": 3},
        {"name": "Week 4", "applications": total_applications if total_applications > 0 else 4},
    ]
    
    return {
        "total_applications": total_applications,
        "status_counts": status_counts,
        "weekly_activity": weekly_activity,
        "ats_score_estimate": ats_score
    }
