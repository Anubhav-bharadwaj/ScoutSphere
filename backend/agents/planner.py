from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.seed_url import SeedURL

async def get_seed_urls(db: AsyncSession) -> list[str]:
    """Fetch all enabled Seed URLs from the database."""
    result = await db.execute(select(SeedURL).where(SeedURL.is_enabled))
    seeds = result.scalars().all()
    return [seed.url for seed in seeds]
