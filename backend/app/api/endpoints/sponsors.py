from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_admin_user, get_current_user
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.challenge import Challenge
from app.schemas import Sponsor as SponsorSchema, SponsorCreate, SponsorUpdate
from app.schemas.challenge import Challenge as ChallengeSchema
from typing import Any, List, Optional
from sqlalchemy import select
import uuid

router = APIRouter()

@router.get("/", response_model=List[SponsorSchema])
async def read_sponsors(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all sponsors
    """
    result = await db.execute(select(Sponsor).offset(skip).limit(limit))
    sponsors = result.scalars().all()
    
    return sponsors

@router.post("/", response_model=SponsorSchema)
async def create_sponsor(
    *,
    db: AsyncSession = Depends(get_db),
    sponsor_in: SponsorCreate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Create new sponsor (admin only)
    """
    # Check if sponsor with this name already exists
    result = await db.execute(select(Sponsor).where(Sponsor.name == sponsor_in.name))
    existing_sponsor = result.scalars().first()
    
    if existing_sponsor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sponsor with this name already exists"
        )
    
    # Create new sponsor
    sponsor_id = uuid.uuid4()
    db_sponsor = Sponsor(
        id=sponsor_id,
        name=sponsor_in.name,
        logo_url=sponsor_in.logo_url,
        description=sponsor_in.description,
        website_url=sponsor_in.website_url,
        contact_email=sponsor_in.contact_email
    )
    
    db.add(db_sponsor)
    await db.commit()
    await db.refresh(db_sponsor)
    
    return db_sponsor

@router.get("/{sponsor_id}", response_model=SponsorSchema)
async def read_sponsor(
    sponsor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a specific sponsor by id
    """
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )
    
    return sponsor

@router.put("/{sponsor_id}", response_model=SponsorSchema)
async def update_sponsor(
    *,
    db: AsyncSession = Depends(get_db),
    sponsor_id: uuid.UUID,
    sponsor_in: SponsorUpdate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Update a sponsor (admin only)
    """
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )
    
    # Update sponsor attributes
    update_data = sponsor_in.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(sponsor, key):
            setattr(sponsor, key, value)
    
    db.add(sponsor)
    await db.commit()
    await db.refresh(sponsor)
    
    return sponsor

@router.get("/{sponsor_id}/challenges", response_model=List[ChallengeSchema])
async def read_sponsor_challenges(
    sponsor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
) -> Any:
    """
    Get all challenges for a specific sponsor
    """
    # First check if sponsor exists
    sponsor_result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = sponsor_result.scalars().first()
    
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )
    
    # Get challenges for sponsor
    query = select(Challenge).where(Challenge.sponsor_id == sponsor_id)
    
    if active_only:
        query = query.where(Challenge.is_active.is_(True))
    
    query = query.order_by(Challenge.submission_deadline.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    challenges = result.scalars().all()
    
    return challenges

@router.delete("/{sponsor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sponsor(
    sponsor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Delete a sponsor (admin only)
    """
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )
    
    # First check if sponsor has any challenges
    challenges_result = await db.execute(
        select(Challenge).where(Challenge.sponsor_id == sponsor_id)
    )
    challenges = challenges_result.scalars().all()
    
    if challenges:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete sponsor with existing challenges"
        )
    
    # Delete sponsor
    await db.delete(sponsor)
    await db.commit()
    
    return None

@router.get("/search/by-name", response_model=List[SponsorSchema])
async def search_sponsors_by_name(
    name: str,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10
) -> Any:
    """
    Search for sponsors by name
    """
    result = await db.execute(
        select(Sponsor).where(Sponsor.name.ilike(f"%{name}%")).offset(skip).limit(limit)
    )
    sponsors = result.scalars().all()
    
    return sponsors
