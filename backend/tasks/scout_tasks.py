import asyncio
import sys

# Workaround for asyncpg + Celery on Windows (fixes AttributeError: 'NoneType' object has no attribute 'send')
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy()) # type: ignore

from backend.core.celery_app import celery_app
from backend.core.database import AsyncSessionLocal
from backend.agents.planner import get_seed_urls
from backend.agents.browser import fetch_markdown
from backend.agents.evaluator import extract_opportunity
from backend.agents.matcher import generate_matches_for_opportunity
from backend.core.vectorstore import vector_store
from backend.models.opportunity import Opportunity
from sqlalchemy import select
import traceback

@celery_app.task
def run_scout_pipeline():
    """
    The main Celery task triggered by Celery Beat or manual trigger API.
    It runs the complete scouting pipeline synchronously (or wraps the asyncio loop).
    """
    print("Scout pipeline triggered via Celery!")
    asyncio.run(_run_pipeline_async())
    return "Pipeline finished"

async def _run_pipeline_async():
    async with AsyncSessionLocal() as db:
        # 1. Planner Agent: Fetch seed URLs
        urls = await get_seed_urls(db)
        print(f"Found {len(urls)} seed URLs.")
        
        for url in urls:
            # 2. Browser Agent: Crawl URLs and extract Markdown
            print(f"Crawling {url}...")
            # Run Playwright in a separate thread to avoid Windows Event Loop conflicts
            markdown = await asyncio.to_thread(fetch_markdown, url)
            
            if not markdown:
                continue
                
            # 3. Evaluator Agent: Parse Markdown into JSON and save to DB
            print(f"Evaluating {url}...")
            data = extract_opportunity(markdown)
            
            if data and data.get("title"):
                # Save to DB or update existing
                result = await db.execute(select(Opportunity).where(Opportunity.source_url == url))
                existing_opp = result.scalars().first()
                
                if existing_opp:
                    print(f"Opportunity already exists: {existing_opp.title}")
                    opp = existing_opp
                else:
                    opp = Opportunity(
                        title=data.get("title")[:255],
                        description=data.get("description"),
                        requirements=data.get("requirements"),
                        source_url=url
                    )
                    db.add(opp)
                    
                try:
                    await db.commit()
                    await db.refresh(opp)
                    if not existing_opp:
                        print(f"Saved new opportunity: {opp.title}")
                    
                    # Phase 3: Vectorize and Match
                    vector_store.vectorize_and_store_opportunity(
                        opp_id=str(opp.id),
                        title=opp.title,
                        description=opp.description or "",
                        requirements=opp.requirements or {}
                    )
                    await generate_matches_for_opportunity(opp, db)
                    print(f"Generated matches for {opp.title}")
                    
                except Exception as e:
                    await db.rollback()
                    print(f"Failed to save opportunity from {url}: {e}")
                    traceback.print_exc()
