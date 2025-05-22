from sqlalchemy import Column, String, Text, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class NotificationType(str, enum.Enum):
    SUBMISSION_STATUS = "submission_status"
    BADGE_AWARDED = "badge_awarded"
    FEEDBACK_RECEIVED = "feedback_received"
    CHALLENGE_REMINDER = "challenge_reminder"
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    SPONSOR_MESSAGE = "sponsor_message"

class Notification(Base):
    """
    Notification model for user alerts and messages
    """
    # Foreign key
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    
    # Content
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    read = Column(Boolean, default=False)
    
    # Optional reference to related entities
    reference_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
