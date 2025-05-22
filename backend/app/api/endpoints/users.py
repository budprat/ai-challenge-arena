from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas import User as UserSchema, UserCreate, UserUpdate
from app.schemas.badge import Badge
from typing import Any, List, Optional
from sqlalchemy import select, func
import uuid

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Retrieve users (admin only)
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
async def read_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific user by id
    """
    # Users can view their own profile or admins can view any profile
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/{user_id}/badges", response_model=List[Badge])
async def read_user_badges(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all badges for a user
    """
    # First check if user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get badges through user_badge relationship
    from app.models.badge import Badge as BadgeModel
    from app.models.user_badge import UserBadge
    
    query = select(BadgeModel).join(
        UserBadge, UserBadge.badge_id == BadgeModel.id
    ).where(UserBadge.user_id == user_id)
    
    result = await db.execute(query)
    badges = result.scalars().all()
    
    return badges

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Update a user (admin only)
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user attributes
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        from app.core.security import get_password_hash
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

@router.get("/search/by-email", response_model=UserSchema)
async def search_user_by_email(
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Search for a user by email (admin only)
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/search/by-name", response_model=List[UserSchema])
async def search_users_by_name(
    name: str,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Search for users by name (admin only)
    """
    result = await db.execute(
        select(User).where(User.name.ilike(f"%{name}%")).offset(skip).limit(limit)
    )
    users = result.scalars().all()
    
    return users
