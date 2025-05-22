from fastapi import APIRouter
from app.api.endpoints import auth, users, challenges, submissions, badges, sponsors, seasons, notifications, leaderboards

# Create the main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
api_router.include_router(badges.router, prefix="/badges", tags=["badges"])
api_router.include_router(sponsors.router, prefix="/sponsors", tags=["sponsors"])
api_router.include_router(seasons.router, prefix="/seasons", tags=["seasons"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(leaderboards.router, prefix="/leaderboards", tags=["leaderboards"])
