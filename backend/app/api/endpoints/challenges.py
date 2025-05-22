from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.models.user import User
from app.models.challenge import Challenge
from app.models.sponsor import Sponsor
from app.schemas import Challenge as ChallengeSchema, ChallengeCreate, ChallengeUpdate
from app.schemas.submission import Submission
from typing import Any, List, Optional
from sqlalchemy import select, func
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get("/", response_model=List[ChallengeSchema])
async def read_challenges(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    sponsor_id: Optional[uuid.UUID] = None,
    season_id: Optional[uuid.UUID] = None
) -> Any:
    """
    Retrieve challenges with optional filtering
    """
    query = select(Challenge)
    
    if active_only:
        query = query.where(Challenge.is_active.is_(True))
    
    if sponsor_id:
        query = query.where(Challenge.sponsor_id == sponsor_id)
    
    if season_id:
        query = query.where(Challenge.season_id == season_id)
    
    # Order by deadline (most recent first)
    query = query.order_by(Challenge.submission_deadline.desc())
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    challenges = result.scalars().all()
    
    return challenges

@router.get("/recommended", response_model=List[ChallengeSchema])
async def read_recommended_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 5
) -> Any:
    """
    Get personalized challenge recommendations for the current user
    """
    # For now, just return active challenges not yet completed by the user
    # In the future, this could use more sophisticated recommendation algorithms
    
    # Get challenges the user has already submitted to
    from app.models.submission import Submission
    
    subquery = select(Submission.challenge_id).where(Submission.user_id == current_user.id)
    result = await db.execute(subquery)
    completed_challenge_ids = result.scalars().all()
    
    # Get active challenges not in the completed list
    query = select(Challenge).where(
        Challenge.is_active.is_(True),
        Challenge.submission_deadline > datetime.now(timezone.utc)
    )
    
    if completed_challenge_ids:
        query = query.where(Challenge.id.not_in(completed_challenge_ids))
    
    query = query.order_by(Challenge.submission_deadline.asc()).limit(limit)
    
    result = await db.execute(query)
    challenges = result.scalars().all()
    
    return challenges

@router.post("/", response_model=ChallengeSchema)
async def create_challenge(
    *,
    db: AsyncSession = Depends(get_db),
    challenge_in: ChallengeCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new challenge (admin or sponsor only)
    """
    # Check if user is admin or associated with sponsor
    is_authorized = current_user.is_admin
    
    if not is_authorized and challenge_in.sponsor_id:
        # Check if user is associated with the sponsor (this would require a user-sponsor relationship)
        # For now, only admins can create challenges
        # This could be extended later to allow sponsor users to create challenges
        is_authorized = False
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate sponsor_id if provided
    if challenge_in.sponsor_id:
        sponsor_result = await db.execute(select(Sponsor).where(Sponsor.id == challenge_in.sponsor_id))
        sponsor = sponsor_result.scalars().first()
        
        if not sponsor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsor not found"
            )
    
    # Create new challenge
    challenge_id = uuid.uuid4()
    db_challenge = Challenge(
        id=challenge_id,
        title=challenge_in.title,
        description=challenge_in.description,
        rules=challenge_in.rules,
        evaluation_criteria=challenge_in.evaluation_criteria,
        data_pack_url=challenge_in.data_pack_url,
        submission_deadline=challenge_in.submission_deadline,
        is_sponsored=challenge_in.sponsor_id is not None,
        prize_amount=challenge_in.prize_amount,
        sponsor_id=challenge_in.sponsor_id,
        season_id=challenge_in.season_id
    )
    
    db.add(db_challenge)
    await db.commit()
    await db.refresh(db_challenge)
    
    return db_challenge

@router.get("/{challenge_id}", response_model=ChallengeSchema)
async def read_challenge(
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a specific challenge by id
    """
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    return challenge

@router.put("/{challenge_id}", response_model=ChallengeSchema)
async def update_challenge(
    *,
    db: AsyncSession = Depends(get_db),
    challenge_id: uuid.UUID,
    challenge_in: ChallengeUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a challenge (admin or sponsor only)
    """
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Check if user is admin or associated with sponsor
    is_authorized = current_user.is_admin
    
    if not is_authorized and challenge.sponsor_id:
        # Check if user is associated with the sponsor (this would require a user-sponsor relationship)
        # For now, only admins can update challenges
        is_authorized = False
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update challenge attributes
    update_data = challenge_in.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(challenge, key):
            setattr(challenge, key, value)
    
    # If sponsor_id is provided, update is_sponsored flag
    if "sponsor_id" in update_data:
        challenge.is_sponsored = update_data["sponsor_id"] is not None
    
    db.add(challenge)
    await db.commit()
    await db.refresh(challenge)
    
    return challenge

@router.get("/{challenge_id}/submissions", response_model=List[Submission])
async def read_challenge_submissions(
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all submissions for a challenge (admin or sponsor only)
    """
    # First check if challenge exists
    challenge_result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = challenge_result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Check if user is admin or associated with sponsor
    is_authorized = current_user.is_admin
    
    if not is_authorized and challenge.sponsor_id:
        # Check if user is associated with the sponsor
        is_authorized = False
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get submissions for the challenge
    from app.models.submission import Submission as SubmissionModel
    
    query = select(SubmissionModel).where(
        SubmissionModel.challenge_id == challenge_id
    ).offset(skip).limit(limit)
    
    result = await db.execute(query)
    submissions = result.scalars().all()
    
    return submissions

@router.get("/search/by-title", response_model=List[ChallengeSchema])
async def search_challenges_by_title(
    title: str,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    active_only: bool = True
) -> Any:
    """
    Search for challenges by title
    """
    query = select(Challenge).where(Challenge.title.ilike(f"%{title}%"))
    
    if active_only:
        query = query.where(Challenge.is_active.is_(True))
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    challenges = result.scalars().all()
    
    return challenges

@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_challenge(
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Delete a challenge (admin only)
    """
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Instead of hard deleting, just mark as inactive
    challenge.is_active = False
    
    db.add(challenge)
    await db.commit()
    
    return None
