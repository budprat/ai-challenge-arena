from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime


# Shared properties
class LeaderboardEntryBase(BaseModel):
    """
    Base leaderboard entry schema with shared properties
    """
    score: Optional[float] = None
    rank: Optional[int] = None
    percentile: Optional[float] = None


# Properties shared by models stored in DB
class LeaderboardEntryInDBBase(LeaderboardEntryBase):
    """
    Schema for leaderboard entry in DB with ID and timestamps
    """
    id: UUID4
    user_id: UUID4
    challenge_id: UUID4
    season_id: Optional[UUID4] = None
    submission_id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class LeaderboardEntry(LeaderboardEntryInDBBase):
    """
    Schema for leaderboard entry response
    """
    pass


# Leaderboard entry with user details (for public display)
class LeaderboardEntryWithUser(LeaderboardEntry):
    """
    Schema for leaderboard entry with user details
    """
    from app.schemas.user import User
    from app.schemas.challenge import Challenge
    
    user: Optional[User] = None
    challenge: Optional[Challenge] = None


# Career leaderboard entry (aggregated across challenges)
class CareerLeaderboardEntry(BaseModel):
    """
    Schema for career leaderboard entry
    """
    user_id: UUID4
    user_name: str
    total_score: float
    challenge_count: int
    average_score: float
    best_rank: int
    badge_count: int
    
    class Config:
        from_attributes = True


# Challenge leaderboard for API response
class ChallengeLeaderboard(BaseModel):
    """
    Schema for full challenge leaderboard response
    """
    from typing import List
    
    challenge_id: UUID4
    challenge_title: str
    entries: List[LeaderboardEntryWithUser]
    total_participants: int
    
    class Config:
        from_attributes = True


# Season leaderboard for API response
class SeasonLeaderboard(BaseModel):
    """
    Schema for full season leaderboard response
    """
    from typing import List
    
    season_id: UUID4
    season_name: str
    entries: List[LeaderboardEntryWithUser]
    total_participants: int
    
    class Config:
        from_attributes = True
