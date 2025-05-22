from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.challenge import Challenge
from app.models.season import Season
from app.models.submission import Submission
from app.models.leaderboard_entry import LeaderboardEntry
from app.schemas.leaderboard import LeaderboardEntry as LeaderboardEntrySchema
from app.schemas.leaderboard import LeaderboardEntryWithUser, ChallengeLeaderboard, SeasonLeaderboard, CareerLeaderboardEntry
from typing import Any, List, Optional
from sqlalchemy import select, func, desc, and_
import uuid

router = APIRouter()

@router.get("/challenge/{challenge_id}", response_model=ChallengeLeaderboard)
async def read_challenge_leaderboard(
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get leaderboard for a specific challenge
    """
    # Check if challenge exists
    challenge_result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = challenge_result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Get leaderboard entries for the challenge
    entries_query = (
        select(LeaderboardEntry)
        .where(LeaderboardEntry.challenge_id == challenge_id)
        .order_by(LeaderboardEntry.rank)
        .offset(skip)
        .limit(limit)
    )
    
    entries_result = await db.execute(entries_query)
    entries = entries_result.scalars().all()
    
    # Convert to LeaderboardEntryWithUser objects with user data
    entries_with_users = []
    for entry in entries:
        # Get user data
        user_result = await db.execute(select(User).where(User.id == entry.user_id))
        user = user_result.scalars().first()
        
        entry_with_user = LeaderboardEntryWithUser.from_orm(entry)
        entry_with_user.user = user
        entry_with_user.challenge = challenge
        
        entries_with_users.append(entry_with_user)
    
    # Get total participants count
    count_result = await db.execute(
        select(func.count())
        .select_from(LeaderboardEntry)
        .where(LeaderboardEntry.challenge_id == challenge_id)
    )
    total_participants = count_result.scalar()
    
    # Create challenge leaderboard response
    challenge_leaderboard = ChallengeLeaderboard(
        challenge_id=challenge.id,
        challenge_title=challenge.title,
        entries=entries_with_users,
        total_participants=total_participants
    )
    
    return challenge_leaderboard

@router.get("/season/{season_id}", response_model=SeasonLeaderboard)
async def read_season_leaderboard(
    season_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get leaderboard for a specific season
    """
    # Check if season exists
    season_result = await db.execute(select(Season).where(Season.id == season_id))
    season = season_result.scalars().first()
    
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )
    
    # Get leaderboard entries for the season
    entries_query = (
        select(LeaderboardEntry)
        .where(LeaderboardEntry.season_id == season_id)
        .order_by(LeaderboardEntry.rank)
        .offset(skip)
        .limit(limit)
    )
    
    entries_result = await db.execute(entries_query)
    entries = entries_result.scalars().all()
    
    # Convert to LeaderboardEntryWithUser objects with user data
    entries_with_users = []
    for entry in entries:
        # Get user data
        user_result = await db.execute(select(User).where(User.id == entry.user_id))
        user = user_result.scalars().first()
        
        # Get challenge data
        challenge_result = await db.execute(select(Challenge).where(Challenge.id == entry.challenge_id))
        challenge = challenge_result.scalars().first()
        
        entry_with_user = LeaderboardEntryWithUser.from_orm(entry)
        entry_with_user.user = user
        entry_with_user.challenge = challenge
        
        entries_with_users.append(entry_with_user)
    
    # Get total participants count
    count_result = await db.execute(
        select(func.count(func.distinct(LeaderboardEntry.user_id)))
        .select_from(LeaderboardEntry)
        .where(LeaderboardEntry.season_id == season_id)
    )
    total_participants = count_result.scalar()
    
    # Create season leaderboard response
    season_leaderboard = SeasonLeaderboard(
        season_id=season.id,
        season_name=season.name,
        entries=entries_with_users,
        total_participants=total_participants
    )
    
    return season_leaderboard

@router.get("/career", response_model=List[CareerLeaderboardEntry])
async def read_career_leaderboard(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get career leaderboard (aggregated scores across all challenges)
    """
    # This query uses SQLAlchemy Core to efficiently compute career stats
    # We'll calculate various metrics per user:
    # - Total score (sum of all submission scores)
    # - Challenge count (number of challenges participated in)
    # - Average score
    # - Best rank
    # - Badge count
    
    # 1. Get users with their total score and challenge count
    from sqlalchemy import Integer, Float, distinct
    from sqlalchemy.sql import text, values, literal_column
    
    query = text("""
        WITH user_stats AS (
            SELECT 
                s.user_id,
                COUNT(DISTINCT s.challenge_id) as challenge_count,
                SUM(s.final_score) as total_score,
                AVG(s.final_score) as average_score,
                MIN(le.rank) as best_rank
            FROM submission s
            LEFT JOIN leaderboard_entry le ON s.id = le.submission_id
            WHERE s.final_score IS NOT NULL
            GROUP BY s.user_id
        ),
        badge_counts AS (
            SELECT
                user_id,
                COUNT(id) as badge_count
            FROM user_badge
            GROUP BY user_id
        )
        SELECT
            u.id as user_id,
            u.name as user_name,
            COALESCE(us.total_score, 0) as total_score,
            COALESCE(us.challenge_count, 0) as challenge_count,
            COALESCE(us.average_score, 0) as average_score,
            COALESCE(us.best_rank, 0) as best_rank,
            COALESCE(bc.badge_count, 0) as badge_count
        FROM "user" u
        LEFT JOIN user_stats us ON u.id = us.user_id
        LEFT JOIN badge_counts bc ON u.id = bc.user_id
        ORDER BY total_score DESC, challenge_count DESC, average_score DESC
        LIMIT :limit OFFSET :skip
    """)
    
    result = await db.execute(query, {"limit": limit, "skip": skip})
    rows = result.fetchall()
    
    # Create CareerLeaderboardEntry objects from query results
    career_entries = []
    for row in rows:
        entry = CareerLeaderboardEntry(
            user_id=row.user_id,
            user_name=row.user_name,
            total_score=row.total_score,
            challenge_count=row.challenge_count,
            average_score=row.average_score,
            best_rank=row.best_rank,
            badge_count=row.badge_count
        )
        career_entries.append(entry)
    
    return career_entries

@router.get("/user/{user_id}/rank/{challenge_id}", response_model=LeaderboardEntrySchema)
async def read_user_rank_for_challenge(
    user_id: uuid.UUID,
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a user's rank for a specific challenge
    """
    # Check if user exists
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if challenge exists
    challenge_result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = challenge_result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Get user's leaderboard entry for this challenge
    entry_result = await db.execute(
        select(LeaderboardEntry).where(
            LeaderboardEntry.user_id == user_id,
            LeaderboardEntry.challenge_id == challenge_id
        )
    )
    entry = entry_result.scalars().first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User has no ranking for this challenge"
        )
    
    return entry

@router.post("/generate/{challenge_id}", response_model=List[LeaderboardEntrySchema])
async def generate_leaderboard_for_challenge(
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Generate or update leaderboard entries for a challenge based on final submission scores.
    This is typically called after all submissions have been evaluated.
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if challenge exists
    challenge_result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = challenge_result.scalars().first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Get all completed submissions for this challenge, ordered by final score
    submissions_result = await db.execute(
        select(Submission).where(
            Submission.challenge_id == challenge_id,
            Submission.final_score.is_not(None)
        ).order_by(desc(Submission.final_score))
    )
    submissions = submissions_result.scalars().all()
    
    if not submissions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No evaluated submissions found for this challenge"
        )
    
    # First, delete any existing leaderboard entries for this challenge
    from sqlalchemy import delete
    await db.execute(
        delete(LeaderboardEntry).where(LeaderboardEntry.challenge_id == challenge_id)
    )
    
    # Create new leaderboard entries
    new_entries = []
    for rank, submission in enumerate(submissions, 1):
        # Calculate percentile (higher is better)
        percentile = 100 * (len(submissions) - rank + 1) / len(submissions)
        
        entry_id = uuid.uuid4()
        entry = LeaderboardEntry(
            id=entry_id,
            user_id=submission.user_id,
            challenge_id=challenge_id,
            season_id=challenge.season_id,
            submission_id=submission.id,
            score=submission.final_score,
            rank=rank,
            percentile=percentile
        )
        
        db.add(entry)
        new_entries.append(entry)
    
    await db.commit()
    
    # Refresh all entries to get their full data
    for entry in new_entries:
        await db.refresh(entry)
    
    # TODO: Check for badge awards based on rank (e.g., top 10%, challenge winner)
    
    return new_entries
