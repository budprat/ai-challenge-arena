from pydantic import BaseModel, UUID4, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


# Shared properties
class ChallengeBase(BaseModel):
    """
    Base challenge schema with shared properties
    """
    title: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    evaluation_criteria: Optional[Dict[str, Any]] = None
    data_pack_url: Optional[HttpUrl] = None
    submission_deadline: Optional[datetime] = None
    is_sponsored: Optional[bool] = False
    prize_amount: Optional[float] = 0.0
    is_active: Optional[bool] = True


# Properties to receive on challenge creation
class ChallengeCreate(ChallengeBase):
    """
    Schema for challenge creation
    """
    title: str
    description: str
    rules: str
    evaluation_criteria: Dict[str, Any]
    submission_deadline: datetime
    sponsor_id: Optional[UUID4] = None
    season_id: Optional[UUID4] = None


# Properties to receive on challenge update
class ChallengeUpdate(ChallengeBase):
    """
    Schema for challenge update
    """
    pass


# Properties shared by models stored in DB
class ChallengeInDBBase(ChallengeBase):
    """
    Schema for challenge in DB with ID and timestamps
    """
    id: UUID4
    created_at: datetime
    updated_at: datetime
    sponsor_id: Optional[UUID4] = None
    season_id: Optional[UUID4] = None
    
    class Config:
        from_attributes = True


# Properties to return to client
class Challenge(ChallengeInDBBase):
    """
    Schema for challenge response
    """
    pass


# Properties stored in DB
class ChallengeInDB(ChallengeInDBBase):
    """
    Schema for challenge in DB
    """
    pass


# Challenge with relationships
class ChallengeWithRelations(Challenge):
    """
    Schema for challenge with relationship data
    """
    from app.schemas.submission import Submission
    from app.schemas.sponsor import Sponsor
    from app.schemas.season import Season
    
    submissions: Optional[List[Submission]] = []
    sponsor: Optional[Sponsor] = None
    season: Optional[Season] = None
