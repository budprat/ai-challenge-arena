from pydantic import BaseModel, UUID4, HttpUrl
from typing import Optional, Dict, Any, List
from datetime import datetime


# Shared properties
class BadgeBase(BaseModel):
    """
    Base badge schema with shared properties
    """
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    criteria: Optional[Dict[str, Any]] = None


# Properties to receive on badge creation
class BadgeCreate(BadgeBase):
    """
    Schema for badge creation
    """
    name: str
    description: str
    image_url: HttpUrl
    criteria: Dict[str, Any]


# Properties to receive on badge update
class BadgeUpdate(BadgeBase):
    """
    Schema for badge update
    """
    pass


# Properties shared by models stored in DB
class BadgeInDBBase(BadgeBase):
    """
    Schema for badge in DB with ID and timestamps
    """
    id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class Badge(BadgeInDBBase):
    """
    Schema for badge response
    """
    pass


# Badge with user count
class BadgeWithUserCount(Badge):
    """
    Schema for badge with user count
    """
    user_count: int = 0


# Badge with relationships
class BadgeWithRelations(Badge):
    """
    Schema for badge with relationship data
    """
    from app.schemas.user import User
    
    users: Optional[List[User]] = []
