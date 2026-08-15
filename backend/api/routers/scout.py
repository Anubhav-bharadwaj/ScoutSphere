from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.core.database import get_db
from backend.models.seed_url import SeedURL
from backend.models.opportunity import Opportunity
from backend.tasks.scout_tasks import _run_pipeline_async

router = APIRouter()

@router.post("/trigger", status_code=status.HTTP_200_OK)
async def trigger_scout():
    """Manually trigger the scout pipeline."""
    # MVP Hack: Run it synchronously so frontend can await it
    await _run_pipeline_async()
    return {"message": "Scout pipeline completed successfully"}

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
