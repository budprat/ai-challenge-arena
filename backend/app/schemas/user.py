from pydantic import BaseModel, EmailStr, HttpUrl, UUID4
from typing import Optional, List
from datetime import datetime


# Shared properties
class UserBase(BaseModel):
    """
    Base user schema with shared properties
    """
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    github_url: Optional[HttpUrl] = None
    portfolio_url: Optional[HttpUrl] = None
    is_active: Optional[bool] = True


# Properties to receive on user creation
class UserCreate(UserBase):
    """
    Schema for user creation
    """
    email: EmailStr
    name: str
    password: str


# Properties to receive on user update
class UserUpdate(UserBase):
    """
    Schema for user update
    """
    password: Optional[str] = None


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    """
    Schema for user in DB with ID and timestamps
    """
    id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class User(UserInDBBase):
    """
    Schema for user response
    """
    pass


# Properties stored in DB
class UserInDB(UserInDBBase):
    """
    Schema for user in DB with password hash
    """
    password_hash: str


# User with relationships
class UserWithRelations(User):
    """
    Schema for user with relationship data
    """
    from app.schemas.submission import Submission
    from app.schemas.badge import Badge
    
    submissions: Optional[List[Submission]] = []
    badges: Optional[List[Badge]] = []
