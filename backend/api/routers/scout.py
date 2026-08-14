from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.core.database import get_db
from backend.models.seed_url import SeedURL
from backend.models.opportunity import Opportunity
from backend.tasks.scout_tasks import run_scout_pipeline

router = APIRouter()

@router.post("/trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_scout():
    """Manually trigger the scout pipeline via Celery."""
    run_scout_pipeline.delay()
    return {"message": "Scout pipeline triggered successfully"}

@router.get("/opportunities")
async def get_opportunities(db: AsyncSession = Depends(get_db)):
    """Fetch parsed opportunities."""
    result = await db.execute(select(Opportunity).limit(50))
    opportunities = result.scalars().all()
    return opportunities

@router.post("/seeds", status_code=status.HTTP_201_CREATED)
async def create_seed(url: str, domain: str, db: AsyncSession = Depends(get_db)):
    """Create a new seed URL."""
    seed = SeedURL(url=url, domain=domain)
    db.add(seed)
    try:
        await db.commit()
        await db.refresh(seed)
        return seed
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Seed URL already exists or error occurred.")
