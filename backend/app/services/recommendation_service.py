from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.question import Question
from app.db.models.attempt import Attempt
from app.db.models.user_topic_progress import UserTopicProgress
from app.services.subscription_service import has_active_subscription


async def get_recommended_questions(
    db: AsyncSession,
    user_id: int,
    limit: int = 10,
):
    has_subscription = await has_active_subscription(db, user_id)

    # Find user's weak topics
    progress_result = await db.execute(
        select(UserTopicProgress)
        .where(UserTopicProgress.user_id == user_id)
        .order_by(
            UserTopicProgress.questions_solved.asc(),
            UserTopicProgress.correct_answers.asc(),
        )
        .limit(5)
    )

    topic_progress = progress_result.scalars().all()

    weak_topic_ids = [item.topic_id for item in topic_progress]

    # Find questions already attempted
    attempt_result = await db.execute(
        select(Attempt.question_id)
        .where(Attempt.user_id == user_id)
    )

    attempted_question_ids = {
        question_id
        for question_id in attempt_result.scalars().all()
    }

    # Build common filters
    filters = [
        Question.is_active == True,
    ]

    if attempted_question_ids:
        filters.append(
            ~Question.id.in_(attempted_question_ids)
        )

    # Premium users can receive DSA questions.
    # Free users can only receive non-DSA questions.
    if not has_subscription:
        filters.append(
            Question.topic.has(
                category="DSA"
            ) == False
        )

    # First preference: weak topics
    if weak_topic_ids:
        weak_filters = filters + [
            Question.topic_id.in_(weak_topic_ids)
        ]

        result = await db.execute(
            select(Question)
            .where(*weak_filters)
            .order_by(Question.difficulty.asc())
            .limit(limit)
        )

        questions = result.scalars().all()

        if questions:
            return [
                (
                    question,
                    "Recommended because this is one of your weak topics",
                )
                for question in questions
            ]

    # Fallback: new questions from available topics
    result = await db.execute(
        select(Question)
        .where(*filters)
        .order_by(Question.difficulty.asc())
        .limit(limit)
    )

    questions = result.scalars().all()

    return [
        (
            question,
            "Recommended as a new practice question",
        )
        for question in questions
    ]