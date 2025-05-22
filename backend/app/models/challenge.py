from sqlalchemy import Boolean, Column, String, Text, ForeignKey, DateTime, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import uuid

class Challenge(Base):
    """
    Challenge model
    """
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    rules = Column(Text, nullable=False)
    evaluation_criteria = Column(JSON, nullable=False)
    data_pack_url = Column(String, nullable=True)
    submission_deadline = Column(DateTime(timezone=True), nullable=False)
    is_sponsored = Column(Boolean, default=False)
    prize_amount = Column(Numeric(10, 2), default=0)
    is_active = Column(Boolean, default=True)
    
    # Foreign keys
    sponsor_id = Column(UUID(as_uuid=True), ForeignKey("sponsor.id"), nullable=True)
    season_id = Column(UUID(as_uuid=True), ForeignKey("season.id"), nullable=True)
    
    # Relationships
    sponsor = relationship("Sponsor", back_populates="challenges")
    season = relationship("Season", back_populates="challenges")
    submissions = relationship("Submission", back_populates="challenge", cascade="all, delete-orphan")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="challenge", cascade="all, delete-orphan")
