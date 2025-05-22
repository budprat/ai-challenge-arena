from pydantic import BaseModel, UUID4, HttpUrl
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.submission import SubmissionStatus


# Shared properties
class SubmissionBase(BaseModel):
    """
    Base submission schema with shared properties
    """
    repo_url: Optional[HttpUrl] = None
    deck_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = None
    description: Optional[str] = None


# Properties to receive on submission creation
class SubmissionCreate(SubmissionBase):
    """
    Schema for submission creation
    """
    repo_url: HttpUrl
    challenge_id: UUID4
    description: Optional[str] = None


# Properties to receive on submission update
class SubmissionUpdate(SubmissionBase):
    """
    Schema for submission update
    """
    pass


# Properties shared by models stored in DB
class SubmissionInDBBase(SubmissionBase):
    """
    Schema for submission in DB with ID and timestamps
    """
    id: UUID4
    user_id: UUID4
    challenge_id: UUID4
    created_at: datetime
    updated_at: datetime
    llm_score: Optional[float] = None
    human_score: Optional[float] = None
    final_score: Optional[float] = None
    status: SubmissionStatus
    
    class Config:
        from_attributes = True


# Properties to return to client
class Submission(SubmissionInDBBase):
    """
    Schema for submission response
    """
    pass


# Properties stored in DB
class SubmissionInDB(SubmissionInDBBase):
    """
    Schema for submission in DB
    """
    evaluation_data: Optional[Dict[str, Any]] = None
    feedback: Optional[str] = None


# Submission with evaluation details
class SubmissionWithEvaluation(Submission):
    """
    Schema for submission with evaluation details
    """
    evaluation_data: Optional[Dict[str, Any]] = None
    feedback: Optional[str] = None


# Submission with relationships
class SubmissionWithRelations(SubmissionWithEvaluation):
    """
    Schema for submission with relationship data
    """
    from app.schemas.user import User
    from app.schemas.challenge import Challenge
    from app.schemas.badge import Badge
    
    user: Optional[User] = None
    challenge: Optional[Challenge] = None
    badges: Optional[List[Badge]] = []
