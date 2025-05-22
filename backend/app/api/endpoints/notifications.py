from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.schemas import Notification as NotificationSchema, NotificationCreate, NotificationUpdate
from typing import Any, List, Optional
from sqlalchemy import select, func, desc
import uuid

router = APIRouter()

@router.get("/", response_model=List[NotificationSchema])
async def read_notifications(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve current user's notifications
    """
    query = select(Notification).where(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.where(Notification.read.is_(False))
    
    # Order by created_at (most recent first)
    query = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return notifications

@router.post("/", response_model=NotificationSchema)
async def create_notification(
    *,
    db: AsyncSession = Depends(get_db),
    notification_in: NotificationCreate,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Create new notification (admin only)
    """
    # Check if user exists
    user_result = await db.execute(select(User).where(User.id == notification_in.user_id))
    user = user_result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create new notification
    notification_id = uuid.uuid4()
    db_notification = Notification(
        id=notification_id,
        user_id=notification_in.user_id,
        title=notification_in.title,
        message=notification_in.message,
        type=notification_in.type,
        reference_id=notification_in.reference_id
    )
    
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    
    return db_notification

@router.get("/unread-count", response_model=int)
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get count of unread notifications for current user
    """
    result = await db.execute(
        select(func.count()).where(
            Notification.user_id == current_user.id,
            Notification.read.is_(False)
        )
    )
    count = result.scalar()
    
    return count

@router.get("/{notification_id}", response_model=NotificationSchema)
async def read_notification(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific notification by id
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return notification

@router.put("/{notification_id}/read", response_model=NotificationSchema)
async def mark_notification_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Mark a notification as read
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Mark as read
    notification.read = True
    
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    return notification

@router.put("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Mark all notifications as read for the current user
    """
    from sqlalchemy import update
    
    # Using SQLAlchemy's update statement for bulk update
    stmt = (
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.read.is_(False)
        )
        .values(read=True)
    )
    
    await db.execute(stmt)
    await db.commit()
    
    return None

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete a notification
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Delete notification
    await db.delete(notification)
    await db.commit()
    
    return None

@router.post("/system-announcement", response_model=List[NotificationSchema])
async def create_system_announcement(
    *,
    db: AsyncSession = Depends(get_db),
    title: str,
    message: str,
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Create a system announcement notification for all active users (admin only)
    """
    # Get all active users
    users_result = await db.execute(select(User).where(User.is_active.is_(True)))
    users = users_result.scalars().all()
    
    notifications = []
    
    # Create notification for each user
    for user in users:
        notification_id = uuid.uuid4()
        db_notification = Notification(
            id=notification_id,
            user_id=user.id,
            title=title,
            message=message,
            type=NotificationType.SYSTEM_ANNOUNCEMENT
        )
        
        db.add(db_notification)
        notifications.append(db_notification)
    
    await db.commit()
    
    # Refresh all notifications to get their full data
    for notification in notifications:
        await db.refresh(notification)
    
    return notifications
