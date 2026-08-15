import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.core.database import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.models.application import Application
from backend.models.opportunity import Opportunity
from backend.tasks.scout_tasks import run_form_filler_pipeline
from pydantic import BaseModel
from groq import AsyncGroq
from backend.core.config import settings

router = APIRouter()
groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

class OpportunityInfo(BaseModel):
    title: str
    company: str

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: uuid.UUID
    opportunity_id: uuid.UUID
    workflow_state: str
    kanban_stage: str
    form_payload: dict
    next_action_note: str | None
    opportunity: OpportunityInfo | None = None
    
    class Config:
        from_attributes = True

@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all applications for the current user."""
    result = await db.execute(
        select(Application)
        .where(Application.user_id == current_user.id)
        .options(selectinload(Application.opportunity))
    )
    return result.scalars().all()

@router.post("/auto-fill/{opportunity_id}", response_model=ApplicationResponse, status_code=status.HTTP_202_ACCEPTED)
async def trigger_auto_fill(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger the Form-Filler agent and initialize application state."""
    # Check if application already exists
    result = await db.execute(
        select(Application)
        .where(
            Application.user_id == current_user.id,
            Application.opportunity_id == opportunity_id
        )
        .options(selectinload(Application.opportunity))
    )
    app_record = result.scalar_one_or_none()
    
    if not app_record:
        # Verify opportunity exists
        opp_result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
        opp = opp_result.scalar_one_or_none()
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
            
        app_record = Application(
            user_id=current_user.id,
            opportunity_id=opportunity_id,
            workflow_state="READY_TO_APPLY",
            kanban_stage="APPLIED"
        )
        db.add(app_record)
        await db.commit()
        
        # Fresh query to load relationship
        result = await db.execute(
            select(Application)
            .where(Application.id == app_record.id)
            .options(selectinload(Application.opportunity))
        )
        app_record = result.scalar_one()
        
    # Queue the Celery Task
    run_form_filler_pipeline.delay(str(app_record.id))
    
    # Return 202 Accepted
    return app_record

@router.get("/{application_id}/status", response_model=ApplicationResponse)
async def get_application_status(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch active application payload and current state for polling."""
    result = await db.execute(
        select(Application)
        .where(
            Application.id == application_id,
            Application.user_id == current_user.id
        )
        .options(selectinload(Application.opportunity))
    )
    app_record = result.scalar_one_or_none()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return app_record

@router.put("/{application_id}/submit", response_model=ApplicationResponse)
async def submit_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Confirm user review and submit."""
    result = await db.execute(
        select(Application)
        .where(
            Application.id == application_id,
            Application.user_id == current_user.id
        )
        .options(selectinload(Application.opportunity))
    )
    app_record = result.scalar_one_or_none()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app_record.workflow_state = "SUBMITTED"
    await db.commit()
    await db.refresh(app_record)
    
    return app_record

class RefineRequest(BaseModel):
    instruction: str

@router.post("/{application_id}/refine", response_model=ApplicationResponse)
async def refine_application_answer(
    application_id: uuid.UUID,
    req: RefineRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Refine the drafted questionnaire answer using AI."""
    result = await db.execute(
        select(Application)
        .where(
            Application.id == application_id,
            Application.user_id == current_user.id
        )
        .options(selectinload(Application.opportunity))
    )
    app_record = result.scalar_one_or_none()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
        
    current_answer = app_record.form_payload.get("questionnaire_answer", "")
    if not current_answer:
        raise HTTPException(status_code=400, detail="No answer drafted yet")
        
    prompt = (
        f"Rewrite the following cover letter answer. Instruction: {req.instruction}\n\n"
        f"Original Answer: {current_answer}\n\n"
        "IMPORTANT: Output ONLY the raw rewritten text. Do not include any conversational filler, "
        "introductory phrases (like 'Here is a rewritten version...'), or markdown formatting."
    )
    
    response = await groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
    )
    
    content = response.choices[0].message.content
    new_answer = content.strip() if content else ""
    
    # Update JSONB payload safely
    payload = dict(app_record.form_payload)
    payload["questionnaire_answer"] = new_answer
    app_record.form_payload = payload
    
    await db.commit()
    await db.refresh(app_record)
    
    return app_record
