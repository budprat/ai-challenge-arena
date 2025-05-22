from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class LeaderboardEntry(Base):
    """
    LeaderboardEntry model for tracking user rankings in challenges and seasons
    """
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenge.id"), nullable=False)
    season_id = Column(UUID(as_uuid=True), ForeignKey("season.id"), nullable=True)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submission.id"), nullable=False)
    
    # Leaderboard position data
    score = Column(Numeric(5, 2), nullable=False)
    rank = Column(Integer, nullable=False)
    percentile = Column(Numeric(5, 2), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="leaderboard_entries")
    challenge = relationship("Challenge", back_populates="leaderboard_entries")
    season = relationship("Season", back_populates="leaderboard_entries")
    submission = relationship("Submission", foreign_keys=[submission_id])
