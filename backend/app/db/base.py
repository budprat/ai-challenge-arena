# Import all models here for Alembic to detect them
from app.db.base_class import Base
from app.models.user import User
from app.models.challenge import Challenge
from app.models.submission import Submission
from app.models.badge import Badge
from app.models.user_badge import UserBadge
from app.models.sponsor import Sponsor
from app.models.season import Season
from app.models.notification import Notification
from app.models.leaderboard_entry import LeaderboardEntry
