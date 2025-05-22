# Import all schemas here for easy access

from app.schemas.user import User, UserCreate, UserUpdate, UserInDB
from app.schemas.challenge import Challenge, ChallengeCreate, ChallengeUpdate, ChallengeInDB
from app.schemas.submission import Submission, SubmissionCreate, SubmissionUpdate, SubmissionInDB
from app.schemas.badge import Badge, BadgeCreate, BadgeUpdate
from app.schemas.user_badge import UserBadge, UserBadgeCreate
from app.schemas.sponsor import Sponsor, SponsorCreate, SponsorUpdate
from app.schemas.season import Season, SeasonCreate, SeasonUpdate
from app.schemas.notification import Notification, NotificationCreate, NotificationUpdate
from app.schemas.leaderboard import LeaderboardEntry
from app.schemas.token import Token, TokenPayload
