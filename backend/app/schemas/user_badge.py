from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime


# Shared properties
class UserBadgeBase(BaseModel):
    """
    Base user badge schema with shared properties
    """
    user_id: Optional[UUID4] = None
    badge_id: Optional[UUID4] = None
    submission_id: Optional[UUID4] = None


# Properties to receive on user badge creation
class UserBadgeCreate(UserBadgeBase):
    """
    Schema for user badge creation
    """
    user_id: UUID4
    badge_id: UUID4
    submission_id: Optional[UUID4] = None


# Properties shared by models stored in DB
class UserBadgeInDBBase(UserBadgeBase):
    """
    Schema for user badge in DB with ID and timestamps
    """
    id: UUID4
    awarded_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class UserBadge(UserBadgeInDBBase):
    """
    Schema for user badge response
    """
    pass


# User badge with relationships
class UserBadgeWithRelations(UserBadge):
    """
    Schema for user badge with relationship data
    """
    from app.schemas.user import User
    from app.schemas.badge import Badge
    from app.schemas.submission import Submission
    
    user: Optional[User] = None
    badge: Optional[Badge] = None
    submission: Optional[Submission] = None
