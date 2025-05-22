import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.core.config import settings
from app.models.user import User
from app.models.badge import Badge
from app.core.security import get_password_hash
import uuid

logger = logging.getLogger(__name__)

# List of default badges to create
DEFAULT_BADGES = [
    {
        "name": "First Submission",
        "description": "Awarded for making your first challenge submission",
        "image_url": "/badges/first-submission.svg",
        "criteria": {"type": "submission", "count": 1}
    },
    {
        "name": "Top 10%",
        "description": "Awarded for placing in the top 10% of a challenge",
        "image_url": "/badges/top-10-percent.svg",
        "criteria": {"type": "ranking", "percentile": 10}
    },
    {
        "name": "Challenge Winner",
        "description": "Awarded for winning a challenge",
        "image_url": "/badges/challenge-winner.svg",
        "criteria": {"type": "ranking", "position": 1}
    },
    {
        "name": "Sponsor Favorite",
        "description": "Awarded when a sponsor marks your submission as a favorite",
        "image_url": "/badges/sponsor-favorite.svg",
        "criteria": {"type": "sponsor_favorite", "count": 1}
    },
    {
        "name": "Perfect Score",
        "description": "Awarded for achieving a perfect score in any evaluation category",
        "image_url": "/badges/perfect-score.svg",
        "criteria": {"type": "score", "value": 100, "category": "any"}
    }
]

async def create_initial_data() -> None:
    """
    Initialize the database with required initial data
    - Creates an admin user if none exists
    - Creates default badges
    """
    try:
        async with AsyncSessionLocal() as db:
            await create_default_badges(db)
            await create_admin_user(db)
        logger.info("Initial data created successfully")
    except Exception as e:
        logger.error(f"Failed to create initial data: {e}")
        raise

async def create_admin_user(db: AsyncSession) -> None:
    """Create an admin user if it doesn't exist"""
    # Check if admin user exists
    admin_email = "admin@elitebuilders.ai"
    
    # Use SQLAlchemy Core for direct query execution
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.email == admin_email))
    admin_exists = result.scalars().first()
    
    if not admin_exists:
        admin_user = User(
            id=uuid.uuid4(),
            email=admin_email,
            name="Admin User",
            is_admin=True,
            password_hash=get_password_hash("changeme"),  # Default password should be changed
            bio="System administrator account",
        )
        db.add(admin_user)
        await db.commit()
        logger.info(f"Created admin user: {admin_email}")

async def create_default_badges(db: AsyncSession) -> None:
    """Create default badges if they don't exist"""
    # Check if badges already exist
    from sqlalchemy import select
    result = await db.execute(select(Badge))
    existing_badges = result.scalars().all()
    
    if not existing_badges:
        # Create default badges
        for badge_data in DEFAULT_BADGES:
            badge = Badge(
                id=uuid.uuid4(),
                name=badge_data["name"],
                description=badge_data["description"],
                image_url=badge_data["image_url"],
                criteria=badge_data["criteria"]
            )
            db.add(badge)
        
        await db.commit()
        logger.info(f"Created {len(DEFAULT_BADGES)} default badges")
