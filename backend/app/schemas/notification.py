from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationType


# Shared properties
class NotificationBase(BaseModel):
    """
    Base notification schema with shared properties
    """
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[NotificationType] = None
    read: Optional[bool] = False
    reference_id: Optional[UUID4] = None


# Properties to receive on notification creation
class NotificationCreate(NotificationBase):
    """
    Schema for notification creation
    """
    user_id: UUID4
    title: str
    message: str
    type: NotificationType


# Properties to receive on notification update
class NotificationUpdate(NotificationBase):
    """
    Schema for notification update (typically for marking as read)
    """
    read: Optional[bool] = True


# Properties shared by models stored in DB
class NotificationInDBBase(NotificationBase):
    """
    Schema for notification in DB with ID and timestamps
    """
    id: UUID4
    user_id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class Notification(NotificationInDBBase):
    """
    Schema for notification response
    """
    pass


# Notification with relationships
class NotificationWithRelations(Notification):
    """
    Schema for notification with relationship data
    """
    from app.schemas.user import User
    
    user: Optional[User] = None
