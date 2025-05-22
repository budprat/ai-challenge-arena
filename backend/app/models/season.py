from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Season(Base):
    """
    Season model for grouping challenges into time periods
    """
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    challenges = relationship("Challenge", back_populates="season")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="season")
