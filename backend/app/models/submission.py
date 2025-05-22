from sqlalchemy import Column, String, Text, ForeignKey, Numeric, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum
import uuid

class SubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    EVALUATED = "evaluated" 
    REVIEWED = "reviewed"
    COMPLETED = "completed"
    REJECTED = "rejected"

class Submission(Base):
    """
    Submission model for challenge entries
    """
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenge.id"), nullable=False)
    
    # Submission content
    repo_url = Column(String, nullable=False)
    deck_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    # Evaluation scores
    llm_score = Column(Numeric(5, 2), nullable=True)
    human_score = Column(Numeric(5, 2), nullable=True) 
    final_score = Column(Numeric(5, 2), nullable=True)
    
    # Detailed evaluation data
    evaluation_data = Column(JSON, nullable=True)
    feedback = Column(Text, nullable=True)
    
    # Status of the submission
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    challenge = relationship("Challenge", back_populates="submissions")
    badges = relationship("UserBadge", back_populates="submission", cascade="all, delete-orphan")
