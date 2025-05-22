from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_admin_user, get_current_user
from app.models.user import User
from app.models.badge import Badge
from app.models.user_badge import UserBadge
from app.schemas import Badge as BadgeSchema, BadgeCreate, BadgeUpdate
from app.schemas.badge import BadgeWithUserCount
from app.schemas.user_badge import UserBadge as UserBadgeSchema, UserBadgeCreate
from typing import Any, List, Optional
from sqlalchemy import select, func
import uuid

router = APIRouter()

@router.get("/", response_model=List[BadgeSchema])
async def read_badges(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all badges
    """
    result = await db.execute(select(Badge).offset(skip).limit(limit))
    badges = result.scalars().all()
    
    return badges

@router.get("/with-counts", response_model=List[BadgeWithUserCount])
async def read_badges_with_counts(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all badges with user counts
    """
    # Get all badges
    badges_result = await db.execute(select(Badge).offset(skip).limit(limit))
    badges = badges_result.scalars().all()
    
    # Get user counts for each badge
    badges_with_counts = []
    for badge in badges:
        count_result = await db.execute(
            select(func.count(UserBadge.id)).where(UserBadge.badge_id == badge.id)
        )
        user_count = count_result.scalar()
        
        badge_with_count = BadgeWithUserCount.from_orm(badge)
        badge_with_count.user_count = user_count
        badges_with_counts.append(badge_with_count)
    
    return badges_with_counts

@router.post("/", response_model=BadgeSchema)
async def create_badge(
    *,
    db: AsyncSession = Depends(get_db),
    badge_in: BadgeCreate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Create new badge (admin only)
    """
    # Check if badge with this name already exists
    result = await db.execute(select(Badge).where(Badge.name == badge_in.name))
    existing_badge = result.scalars().first()
    
    if existing_badge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Badge with this name already exists"
        )
    
    # Create new badge
    badge_id = uuid.uuid4()
    db_badge = Badge(
        id=badge_id,
        name=badge_in.name,
        description=badge_in.description,
        image_url=badge_in.image_url,
        criteria=badge_in.criteria
    )
    
    db.add(db_badge)
    await db.commit()
    await db.refresh(db_badge)
    
    return db_badge

@router.get("/{badge_id}", response_model=BadgeSchema)
async def read_badge(
    badge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a specific badge by id
    """
    result = await db.execute(select(Badge).where(Badge.id == badge_id))
    badge = result.scalars().first()
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    return badge

@router.put("/{badge_id}", response_model=BadgeSchema)
async def update_badge(
    *,
    db: AsyncSession = Depends(get_db),
    badge_id: uuid.UUID,
    badge_in: BadgeUpdate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Update a badge (admin only)
    """
    result = await db.execute(select(Badge).where(Badge.id == badge_id))
    badge = result.scalars().first()
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    # Update badge attributes
    update_data = badge_in.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(badge, key):
            setattr(badge, key, value)
    
    db.add(badge)
    await db.commit()
    await db.refresh(badge)
    
    return badge

@router.post("/award", response_model=UserBadgeSchema)
async def award_badge(
    *,
    db: AsyncSession = Depends(get_db),
    badge_award: UserBadgeCreate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Award a badge to a user (admin only)
    """
    # Check if user exists
    from app.models.user import User
    user_result = await db.execute(select(User).where(User.id == badge_award.user_id))
    user = user_result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if badge exists
    badge_result = await db.execute(select(Badge).where(Badge.id == badge_award.badge_id))
    badge = badge_result.scalars().first()
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    # Check if user already has this badge
    existing_result = await db.execute(
        select(UserBadge).where(
            UserBadge.user_id == badge_award.user_id,
            UserBadge.badge_id == badge_award.badge_id
        )
    )
    existing_award = existing_result.scalars().first()
    
    if existing_award:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this badge"
        )
    
    # If submission_id is provided, verify it exists and belongs to the user
    if badge_award.submission_id:
        from app.models.submission import Submission
        submission_result = await db.execute(
            select(Submission).where(
                Submission.id == badge_award.submission_id,
                Submission.user_id == badge_award.user_id
            )
        )
        submission = submission_result.scalars().first()
        
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found or does not belong to user"
            )
    
    # Award badge to user
    user_badge_id = uuid.uuid4()
    db_user_badge = UserBadge(
        id=user_badge_id,
        user_id=badge_award.user_id,
        badge_id=badge_award.badge_id,
        submission_id=badge_award.submission_id
    )
    
    db.add(db_user_badge)
    await db.commit()
    await db.refresh(db_user_badge)
    
    # TODO: Create notification for user about new badge
    
    return db_user_badge

@router.get("/{badge_id}/users", response_model=List[UserBadgeSchema])
async def read_badge_users(
    badge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all users who have earned a specific badge
    """
    # First check if badge exists
    badge_result = await db.execute(select(Badge).where(Badge.id == badge_id))
    badge = badge_result.scalars().first()
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    # Get all user badges for this badge
    query = select(UserBadge).where(UserBadge.badge_id == badge_id).offset(skip).limit(limit)
    result = await db.execute(query)
    user_badges = result.scalars().all()
    
    return user_badges
