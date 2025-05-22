from pydantic import BaseModel, UUID4, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime


# Shared properties
class SponsorBase(BaseModel):
    """
    Base sponsor schema with shared properties
    """
    name: Optional[str] = None
    logo_url: Optional[HttpUrl] = None
    description: Optional[str] = None
    website_url: Optional[HttpUrl] = None
    contact_email: Optional[EmailStr] = None


# Properties to receive on sponsor creation
class SponsorCreate(SponsorBase):
    """
    Schema for sponsor creation
    """
    name: str
    contact_email: EmailStr


# Properties to receive on sponsor update
class SponsorUpdate(SponsorBase):
    """
    Schema for sponsor update
    """
    pass


# Properties shared by models stored in DB
class SponsorInDBBase(SponsorBase):
    """
    Schema for sponsor in DB with ID and timestamps
    """
    id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class Sponsor(SponsorInDBBase):
    """
    Schema for sponsor response
    """
    pass


# Sponsor with relationships
class SponsorWithRelations(Sponsor):
    """
    Schema for sponsor with relationship data
    """
    from app.schemas.challenge import Challenge
    
    challenges: Optional[List[Challenge]] = []
