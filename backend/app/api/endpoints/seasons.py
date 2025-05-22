from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_admin_user
from app.models.user import User
from app.models.season import Season
from app.models.challenge import Challenge
from app.schemas import Season as SeasonSchema, SeasonCreate, SeasonUpdate
from app.schemas.challenge import Challenge as ChallengeSchema
from typing import Any, List, Optional
from sqlalchemy import select
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get("/", response_model=List[SeasonSchema])
async def read_seasons(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False
) -> Any:
    """
    Retrieve all seasons
    """
    query = select(Season)
    
    if active_only:
        now = datetime.now(timezone.utc)
        query = query.where(Season.start_date <= now, Season.end_date >= now)
    
    # Order by start date (most recent first)
    query = query.order_by(Season.start_date.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    seasons = result.scalars().all()
    
    return seasons

@router.get("/current", response_model=SeasonSchema)
async def read_current_season(
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get the current active season
    """
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Season).where(
            Season.start_date <= now,
            Season.end_date >= now
        )
    )
    season = result.scalars().first()
    
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active season found"
        )
    
    return season

@router.post("/", response_model=SeasonSchema)
async def create_season(
    *,
    db: AsyncSession = Depends(get_db),
    season_in: SeasonCreate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Create new season (admin only)
    """
    # Check if season with this name already exists
    result = await db.execute(select(Season).where(Season.name == season_in.name))
    existing_season = result.scalars().first()
    
    if existing_season:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Season with this name already exists"
        )
    
    # Validate start and end dates
    if season_in.start_date >= season_in.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    
    # Check for overlap with existing seasons
    overlap_result = await db.execute(
        select(Season).where(
            (Season.start_date <= season_in.end_date) & 
            (Season.end_date >= season_in.start_date)
        )
    )
    overlapping_season = overlap_result.scalars().first()
    
    if overlapping_season:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Season overlaps with existing season: {overlapping_season.name}"
        )
    
    # Create new season
    season_id = uuid.uuid4()
    db_season = Season(
        id=season_id,
        name=season_in.name,
        description=season_in.description,
        start_date=season_in.start_date,
        end_date=season_in.end_date
    )
    
    db.add(db_season)
    await db.commit()
    await db.refresh(db_season)
    
    return db_season

@router.get("/{season_id}", response_model=SeasonSchema)
async def read_season(
    season_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a specific season by id
    """
    result = await db.execute(select(Season).where(Season.id == season_id))
    season = result.scalars().first()
    
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )
    
    return season

@router.put("/{season_id}", response_model=SeasonSchema)
async def update_season(
    *,
    db: AsyncSession = Depends(get_db),
    season_id: uuid.UUID,
    season_in: SeasonUpdate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Update a season (admin only)
    """
    result = await db.execute(select(Season).where(Season.id == season_id))
    season = result.scalars().first()
    
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )
    
    # Validate start and end dates if both are provided
    update_data = season_in.dict(exclude_unset=True)
    if "start_date" in update_data and "end_date" in update_data:
        if update_data["start_date"] >= update_data["end_date"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date"
            )
    elif "start_date" in update_data and update_data["start_date"] >= season.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    elif "end_date" in update_data and season.start_date >= update_data["end_date"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    
    # Check for overlap with existing seasons
    new_start = update_data.get("start_date", season.start_date)
    new_end = update_data.get("end_date", season.end_date)
    
    overlap_result = await db.execute(
        select(Season).where(
            Season.id != season_id,
            Season.start_date <= new_end,
            Season.end_date >= new_start
        )
    )
    overlapping_season = overlap_result.scalars().first()
    
    if overlapping_season:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Season overlaps with existing season: {overlapping_season.name}"
        )
    
    # Update season attributes
    for key, value in update_data.items():
        if hasattr(season, key):
            setattr(season, key, value)
    
    db.add(season)
    await db.commit()
    await db.refresh(season)
    
    return season

@router.get("/{season_id}/challenges", response_model=List[ChallengeSchema])
async def read_season_challenges(
    season_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
) -> Any:
    """
    Get all challenges for a specific season
    """
    # First check if season exists
    season_result = await db.execute(select(Season).where(Season.id == season_id))
    season = season_result.scalars().first()
    
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )
    
    # Get challenges for season
    query = select(Challenge).where(Challenge.season_id == season_id)
    
    if active_only:
        query = query.where(Challenge.is_active.is_(True))
    
    query = query.order_by(Challenge.submission_deadline.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    challenges = result.scalars().all()
    
    return challenges

@router.delete("/{season_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_season(
    season_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Delete a season (admin only)
    """
    result = await db.execute(select(Season).where(Season.id == season_id))
    season = result.scalars().first()
    
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )
    
    # First check if season has any challenges
    challenges_result = await db.execute(
        select(Challenge).where(Challenge.season_id == season_id)
    )
    challenges = challenges_result.scalars().all()
    
    if challenges:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete season with existing challenges"
        )
    
    # Check if this is an active season
    now = datetime.now(timezone.utc)
    if season.start_date <= now <= season.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an active season"
        )
    
    # Delete season
    await db.delete(season)
    await db.commit()
    
    return None
