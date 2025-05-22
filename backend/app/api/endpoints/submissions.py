from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.models.user import User
from app.models.submission import Submission, SubmissionStatus
from app.models.challenge import Challenge
from app.schemas import Submission as SubmissionSchema, SubmissionCreate, SubmissionUpdate
from app.schemas.submission import SubmissionWithEvaluation
from typing import Any, List, Optional
from sqlalchemy import select, func
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get("/", response_model=List[SubmissionSchema])
async def read_submissions(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[SubmissionStatus] = None,
    challenge_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Retrieve submissions with optional filtering (admin only)
    """
    query = select(Submission)
    
    if status:
        query = query.where(Submission.status == status)
    
    if challenge_id:
        query = query.where(Submission.challenge_id == challenge_id)
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    submissions = result.scalars().all()
    
    return submissions

@router.get("/my", response_model=List[SubmissionSchema])
async def read_my_submissions(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    challenge_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve current user's submissions
    """
    query = select(Submission).where(Submission.user_id == current_user.id)
    
    if challenge_id:
        query = query.where(Submission.challenge_id == challenge_id)
    
    # Order by created_at (most recent first)
    query = query.order_by(Submission.created_at.desc())
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    submissions = result.scalars().all()
    
    return submissions

@router.post("/", response_model=SubmissionSchema)
async def create_submission(
    *,
    db: AsyncSession = Depends(get_db),
    submission_in: SubmissionCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new submission
    """
    # Check if challenge exists and is active
    challenge_result = await db.execute(
        select(Challenge).where(
            Challenge.id == submission_in.challenge_id,
            Challenge.is_active.is_(True)
        )
    )
    challenge = challenge_result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found or inactive"
        )
    
    # Check if submission deadline has passed
    now = datetime.now(timezone.utc)
    if challenge.submission_deadline < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission deadline has passed"
        )
    
    # Check if user already has a submission for this challenge
    existing_result = await db.execute(
        select(Submission).where(
            Submission.user_id == current_user.id,
            Submission.challenge_id == submission_in.challenge_id
        )
    )
    existing_submission = existing_result.scalars().first()
    
    if existing_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a submission for this challenge. Please update it instead."
        )
    
    # Create new submission
    submission_id = uuid.uuid4()
    db_submission = Submission(
        id=submission_id,
        user_id=current_user.id,
        challenge_id=submission_in.challenge_id,
        repo_url=submission_in.repo_url,
        deck_url=submission_in.deck_url,
        video_url=submission_in.video_url,
        description=submission_in.description,
        status=SubmissionStatus.PENDING
    )
    
    db.add(db_submission)
    await db.commit()
    await db.refresh(db_submission)
    
    # TODO: Queue submission for automated evaluation
    # This would be handled by a background task/worker
    
    return db_submission

@router.get("/{submission_id}", response_model=SubmissionWithEvaluation)
async def read_submission(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific submission by id
    """
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalars().first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if user is authorized to view this submission
    # Users can view their own submissions, admins can view any submission
    if submission.user_id != current_user.id and not current_user.is_admin:
        # Also check if user is associated with the challenge sponsor
        is_sponsor_user = False
        
        # This would need a proper user-sponsor relationship check
        # For now, only allow admin or submission owner
        
        if not is_sponsor_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    return submission

@router.put("/{submission_id}", response_model=SubmissionSchema)
async def update_submission(
    *,
    db: AsyncSession = Depends(get_db),
    submission_id: uuid.UUID,
    submission_in: SubmissionUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a submission
    """
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalars().first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if user is the submission owner
    if submission.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if submission is in a state that can be updated
    if submission.status not in [SubmissionStatus.PENDING, SubmissionStatus.PROCESSING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update submission after evaluation"
        )
    
    # Check if challenge deadline has passed
    challenge_result = await db.execute(select(Challenge).where(Challenge.id == submission.challenge_id))
    challenge = challenge_result.scalars().first()
    
    now = datetime.now(timezone.utc)
    if challenge and challenge.submission_deadline < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission deadline has passed"
        )
    
    # Update submission attributes
    update_data = submission_in.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(submission, key):
            setattr(submission, key, value)
    
    # Reset status to pending if content was updated
    if any(key in update_data for key in ["repo_url", "deck_url", "video_url"]):
        submission.status = SubmissionStatus.PENDING
        submission.llm_score = None
        submission.human_score = None
        submission.final_score = None
        submission.evaluation_data = None
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    # TODO: Queue submission for re-evaluation if needed
    
    return submission

@router.post("/{submission_id}/evaluate", response_model=SubmissionWithEvaluation)
async def evaluate_submission(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Trigger evaluation for a submission (admin only)
    """
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalars().first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Update status to processing
    submission.status = SubmissionStatus.PROCESSING
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    # TODO: Queue submission for evaluation
    # This would be handled by a background task/worker that calls the AI evaluation service
    
    return submission

@router.post("/{submission_id}/review", response_model=SubmissionWithEvaluation)
async def review_submission(
    *,
    db: AsyncSession = Depends(get_db),
    submission_id: uuid.UUID,
    human_score: float = Body(..., ge=0, le=100),
    feedback: str = Body(...),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Submit human review for a submission (admin only)
    """
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalars().first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if submission has been evaluated by LLM
    if submission.status not in [SubmissionStatus.EVALUATED, SubmissionStatus.REVIEWED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission must be evaluated by AI before human review"
        )
    
    # Update human review data
    submission.human_score = human_score
    submission.feedback = feedback
    submission.status = SubmissionStatus.REVIEWED
    
    # Calculate final score (e.g., weighted average of LLM and human scores)
    if submission.llm_score is not None:
        llm_weight = 0.7  # 70% LLM, 30% human
        submission.final_score = (submission.llm_score * llm_weight) + (human_score * (1 - llm_weight))
    else:
        submission.final_score = human_score
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    # TODO: Update leaderboard and check for badge awards
    
    return submission

@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete a submission
    """
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalars().first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if user is the submission owner or admin
    if submission.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if submission is in a state that can be deleted
    if submission.status not in [SubmissionStatus.PENDING, SubmissionStatus.PROCESSING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete submission after evaluation"
        )
    
    # Delete submission
    await db.delete(submission)
    await db.commit()
    
    return None
