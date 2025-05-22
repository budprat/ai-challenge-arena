from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Sponsor(Base):
    """
    Sponsor model for companies and organizations that sponsor challenges
    """
    name = Column(String, nullable=False, index=True)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    website_url = Column(String, nullable=True)
    contact_email = Column(String, nullable=False)
    
    # Relationships
    challenges = relationship("Challenge", back_populates="sponsor")
