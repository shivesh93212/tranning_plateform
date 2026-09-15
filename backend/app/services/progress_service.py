from datetime import datetime, date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.attempt import Attempt
from app.db.models.user_progress import UserProgress
from app.db.models.user_topic_progress import UserTopicProgress
from app.db.models.question import Question


async def update_progress_after_attempt(
    db: AsyncSession,
    attempt: Attempt,
) -> None:

    # --------------------------------
    # Get question
    # --------------------------------

    result = await db.execute(
        select(Question).where(
            Question.id == attempt.question_id
        )
    )

    question = result.scalar_one_or_none()

    if not question:
        return

    # --------------------------------
    # Get User Progress
    # --------------------------------

    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == attempt.user_id
        )
    )

    user_progress = result.scalar_one_or_none()

    # Create progress if first attempt
    if not user_progress:

        user_progress = UserProgress(
            user_id=attempt.user_id,
            questions_solved=0,
            correct_answers=0,
            wrong_answers=0,
            streak_days=0,
        )

        db.add(user_progress)

        await db.flush()

    # --------------------------------
    # Update overall statistics
    # --------------------------------

    user_progress.questions_solved += 1

    if attempt.is_correct:
        user_progress.correct_answers += 1
    else:
        user_progress.wrong_answers += 1

    # --------------------------------
    # Update streak
    # --------------------------------

    now = datetime.utcnow()

    if user_progress.last_activity_at is None:

        user_progress.streak_days = 1

    else:

        last_date = user_progress.last_activity_at.date()
        current_date = now.date()

        difference = (
            current_date - last_date
        ).days

        if difference == 0:
            # Already active today
            pass

        elif difference == 1:
            # Consecutive day
            user_progress.streak_days += 1

        else:
            # Streak broken
            user_progress.streak_days = 1

    user_progress.last_activity_at = now

    # --------------------------------
    # Get Topic Progress
    # --------------------------------

    result = await db.execute(
        select(UserTopicProgress).where(
            UserTopicProgress.user_id == attempt.user_id,
            UserTopicProgress.topic_id == question.topic_id,
        )
    )

    topic_progress = result.scalar_one_or_none()

    # Create first topic progress
    if not topic_progress:

        topic_progress = UserTopicProgress(
            user_id=attempt.user_id,
            topic_id=question.topic_id,
            questions_solved=0,
            correct_answers=0,
            wrong_answers=0,
        )

        db.add(topic_progress)

        await db.flush()

    # --------------------------------
    # Update topic statistics
    # --------------------------------

    topic_progress.questions_solved += 1

    if attempt.is_correct:
        topic_progress.correct_answers += 1
    else:
        topic_progress.wrong_answers += 1

    topic_progress.last_attempted_at = now