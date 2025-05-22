from sqlalchemy import Column, String, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Badge(Base):
    """
    Badge model for user achievements
    """
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=False)
    
    # Criteria for automatic badge awarding
    # Stored as JSON with structure like:
    # {
    #   "type": "submission|ranking|sponsor_favorite|score",
    #   "count": 1,                 # For counting based badges
    #   "percentile": 10,           # For ranking based badges (top X%)
    #   "position": 1,              # For specific position (e.g., winner)
    #   "value": 100,               # For score based badges
    #   "category": "any|specific"  # For category specific badges
    # }
    criteria = Column(JSON, nullable=False)
    
    # Relationships
    users = relationship("UserBadge", back_populates="badge")
