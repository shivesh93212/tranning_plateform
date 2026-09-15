from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models.attempt import Attempt
from app.db.models.question import Question
from app.db.models.question_option import QuestionOption
from app.db.models.user import User
from app.dependencies.auth import get_current_user
from app.schemas.attempt import AttemptCreate, AttemptResponse

from sqlalchemy.orm import selectinload

from app.db.models.question import Question

from app.schemas.attempt import PracticeQuestionResponse
from app.schemas.attempt import AttemptResultResponse
from app.services.progress_service import (
    update_progress_after_attempt,
)

from sqlalchemy import select
from app.db.models.user_progress import UserProgress
from app.db.models.user_topic_progress import UserTopicProgress
from app.db.models.topic import Topic

from app.schemas.progress import UserProgressResponse, TopicProgressResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.dependencies.auth import get_current_user

router = APIRouter()


# =========================
# SUBMIT ANSWER
# =========================

@router.post(
    "/attempt",
    response_model=AttemptResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_attempt(
    data: AttemptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -------------------------
    # Get Question
    # -------------------------

    result = await db.execute(
        select(Question).where(
            Question.id == data.question_id,
            Question.is_active == True,
        )
    )

    question = result.scalar_one_or_none()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found or inactive",
        )

    # -------------------------
    # Check selected option
    # -------------------------

    selected_option = None

    if data.selected_option_id is not None:

        result = await db.execute(
            select(QuestionOption).where(
                QuestionOption.id == data.selected_option_id,
                QuestionOption.question_id == data.question_id,
            )
        )

        selected_option = result.scalar_one_or_none()

        if not selected_option:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid option for this question",
            )

    # -------------------------
    # Determine correct answer
    # -------------------------

    is_correct = (
        selected_option is not None
        and selected_option.is_correct
    )

    # -------------------------
    # Create Attempt
    # -------------------------

    attempt = Attempt(
        user_id=current_user.id,
        question_id=data.question_id,
        selected_option_id=(
            data.selected_option_id
            if selected_option
            else None
        ),
        is_correct=is_correct,
        time_taken_seconds=data.time_taken_seconds,
    )

    db.add(attempt)

    db.add(attempt)

    await db.flush()

    await update_progress_after_attempt(
        db,
        attempt,
    )
    
    await db.commit()

    await db.refresh(attempt)

    return attempt

# =========================
# GET MY ATTEMPTS
# =========================

@router.get(
    "/attempts",
    response_model=list[AttemptResponse],
)
async def get_my_attempts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Attempt)
        .where(
            Attempt.user_id == current_user.id
        )
        .order_by(
            Attempt.attempted_at.desc()
        )
    )

    attempts = result.scalars().all()

    return attempts

# =========================
# GET ATTEMPT RESULT
# =========================

@router.get(
    "/attempts/{attempt_id}/result",
    response_model=AttemptResultResponse,
)
async def get_attempt_result(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -------------------------
    # Get user's attempt
    # -------------------------

    result = await db.execute(
        select(Attempt)
        .where(
            Attempt.id == attempt_id,
            Attempt.user_id == current_user.id,
        )
    )

    attempt = result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found",
        )

    # -------------------------
    # Get question
    # -------------------------

    result = await db.execute(
        select(Question)
        .where(
            Question.id == attempt.question_id
        )
    )

    question = result.scalar_one_or_none()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    # -------------------------
    # Get correct option
    # -------------------------

    result = await db.execute(
        select(QuestionOption)
        .where(
            QuestionOption.question_id == question.id,
            QuestionOption.is_correct == True,
        )
    )

    correct_option = result.scalar_one_or_none()

    if not correct_option:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Correct option not configured",
        )

    return AttemptResultResponse(
        attempt_id=attempt.id,
        question_id=question.id,
        selected_option_id=attempt.selected_option_id,
        correct_option_id=correct_option.id,
        is_correct=attempt.is_correct,
        explanation=question.explanation,
        shortcut=question.shortcut,
        solution_steps=question.solution_steps,
    )

# =========================
# GET PRACTICE QUESTIONS
# =========================

@router.get(
    "/questions",
    response_model=list[PracticeQuestionResponse],
)
async def get_practice_questions(
    topic_id: int | None = None,
    subtopic_id: int | None = None,
    difficulty: int | None = None,
    question_type: str | None = None,
    source_type: str | None = None,
    company_year: int | None = None,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 50",
        )

    query = (
        select(Question)
        .options(
            selectinload(Question.options)
        )
        .where(
            Question.is_active == True
        )
    )

    # Topic filter
    if topic_id is not None:
        query = query.where(
            Question.topic_id == topic_id
        )

    # Subtopic filter
    if subtopic_id is not None:
        query = query.where(
            Question.subtopic_id == subtopic_id
        )

    # Difficulty filter
    if difficulty is not None:

        if difficulty < 1 or difficulty > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Difficulty must be between 1 and 5",
            )

        query = query.where(
            Question.difficulty == difficulty
        )

    # Question type
    if question_type is not None:
        query = query.where(
            Question.question_type == question_type
        )

    # Source type
    if source_type is not None:
        query = query.where(
            Question.source_type == source_type
        )

    # Company year
    if company_year is not None:
        query = query.where(
            Question.company_year == company_year
        )

    query = (
        query
        .order_by(Question.id.desc())
        .limit(limit)
    )

    result = await db.execute(query)

    questions = result.scalars().unique().all()

    return questions

@router.get("/progress", response_model=UserProgressResponse)
async def get_my_progress(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id
        )
    )

    progress = result.scalar_one_or_none()

    if not progress:
        return {
            "questions_solved": 0,
            "correct_answers": 0,
            "wrong_answers": 0,
            "accuracy": 0.0,
            "streak_days": 0,
            "last_activity_at": None,
        }

    accuracy = 0.0

    if progress.questions_solved > 0:
        accuracy = round(
            (progress.correct_answers / progress.questions_solved) * 100,
            2,
        )

    return {
        "questions_solved": progress.questions_solved,
        "correct_answers": progress.correct_answers,
        "wrong_answers": progress.wrong_answers,
        "accuracy": accuracy,
        "streak_days": progress.streak_days,
        "last_activity_at": progress.last_activity_at,
    }

@router.get("/progress/topics", response_model=list[TopicProgressResponse])
async def get_topic_progress(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            UserTopicProgress,
            Topic.name,
        )
        .join(
            Topic,
            UserTopicProgress.topic_id == Topic.id,
        )
        .where(
            UserTopicProgress.user_id == current_user.id
        )
        .order_by(
            UserTopicProgress.questions_solved.desc()
        )
    )

    rows = result.all()

    response = []

    for progress, topic_name in rows:

        accuracy = 0.0

        if progress.questions_solved > 0:
            accuracy = round(
                (progress.correct_answers / progress.questions_solved) * 100,
                2,
            )

        response.append(
            {
                "topic_id": progress.topic_id,
                "topic_name": topic_name,
                "questions_solved": progress.questions_solved,
                "correct_answers": progress.correct_answers,
                "wrong_answers": progress.wrong_answers,
                "accuracy": accuracy,
                "last_attempted_at": progress.last_attempted_at,
            }
        )

    return response