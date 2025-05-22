from sqlalchemy import Column, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserBadge(Base):
    """
    UserBadge model - represents the many-to-many relationship between Users and Badges
    """
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badge.id"), nullable=False)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submission.id"), nullable=True)
    
    # When the badge was awarded
    awarded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="users")
    submission = relationship("Submission", back_populates="badges")
