from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime


# Shared properties
class SeasonBase(BaseModel):
    """
    Base season schema with shared properties
    """
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# Properties to receive on season creation
class SeasonCreate(SeasonBase):
    """
    Schema for season creation
    """
    name: str
    start_date: datetime
    end_date: datetime


# Properties to receive on season update
class SeasonUpdate(SeasonBase):
    """
    Schema for season update
    """
    pass


# Properties shared by models stored in DB
class SeasonInDBBase(SeasonBase):
    """
    Schema for season in DB with ID and timestamps
    """
    id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class Season(SeasonInDBBase):
    """
    Schema for season response
    """
    pass


# Season with relationships
class SeasonWithRelations(Season):
    """
    Schema for season with relationship data
    """
    from app.schemas.challenge import Challenge
    from app.schemas.leaderboard import LeaderboardEntry
    
    challenges: Optional[List[Challenge]] = []
    leaderboard_entries: Optional[List[LeaderboardEntry]] = []
