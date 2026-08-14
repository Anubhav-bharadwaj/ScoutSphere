import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.user import User
from backend.models.profile import Profile
from backend.models.opportunity import Opportunity
from backend.models.match import Match
from backend.core.vectorstore import vector_store

async def generate_matches_for_opportunity(opp: Opportunity, db: AsyncSession):
    """
    Computes and saves match scores for all users against a new opportunity.
    """
    # 1. Fetch all user profiles
    result = await db.execute(select(Profile).join(User))
    profiles = result.scalars().all()
    
    if not profiles:
        return
        
    for profile in profiles:
        # Calculate individual components
        
        # Skills (40%)
        skills_text = " ".join(profile.skills) if profile.skills else ""
        semantic_scores = vector_store.query_similarity(skills_text, n_results=100)
        semantic_score = semantic_scores.get(str(opp.id), 0.0)
        
        # Eligibility (25%)
        eligibility_score = 1.0 # Default full points for MVP unless explicitly disqualified
        reqs_str = str(opp.requirements).lower() if opp.requirements else ""
        education_level = profile.education.get("level", "") if isinstance(profile.education, dict) else ""
        if "student" in reqs_str and education_level not in ["Undergraduate", "Graduate", "High School"]:
            eligibility_score = 0.0
            
        # Location Preference (15%)
        location_score = 0.8
        locations = profile.preferences_json.get("locations", []) if isinstance(profile.preferences_json, dict) else []
        if locations and any(loc.lower() in reqs_str for loc in locations if isinstance(loc, str)):
            location_score = 1.0
            
        # Experience Match (10%)
        experience_score = 0.8
        
        # Deadline Urgency (10%)
        deadline_score = 0.5
        if opp.deadline:
            delta = opp.deadline - datetime.datetime.now(datetime.timezone.utc)
            days = delta.days
            if 0 < days <= 14:
                deadline_score = 1.0
            elif days <= 0:
                deadline_score = 0.0 # Expired
            else:
                deadline_score = 0.5
                
        # Weighted Total
        total_score = (
            (semantic_score * 0.40) +
            (eligibility_score * 0.25) +
            (location_score * 0.15) +
            (experience_score * 0.10) +
            (deadline_score * 0.10)
        )
        
        # Normalize and round
        final_score = round(min(1.0, max(0.0, total_score)), 2)
        
        # Generate Justification 
        reasons = []
        if semantic_score > 0.7:
            reasons.append("Strong skill alignment.")
        if deadline_score == 1.0:
            reasons.append("Approaching deadline.")
        if eligibility_score == 0.0:
            reasons.append("May not meet eligibility requirements.")
        reason_text = " ".join(reasons) if reasons else "Moderate match based on profile."
        
        # Upsert match
        existing_result = await db.execute(
            select(Match).where(Match.user_id == profile.user_id, Match.opportunity_id == opp.id)
        )
        existing = existing_result.scalars().first()
        
        if existing:
            existing.score = final_score
            existing.reason = reason_text
        else:
            new_match = Match(
                user_id=profile.user_id,
                opportunity_id=opp.id,
                score=final_score,
                reason=reason_text
            )
            db.add(new_match)
            
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"Failed to save matches for {opp.id}: {e}")
