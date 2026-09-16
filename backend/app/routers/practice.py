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
from app.db.models.question import Question
from app.db.models.user_progress import UserProgress
from app.db.models.user_topic_progress import UserTopicProgress
from app.db.models.topic import Topic
from app.schemas.dashboard import DashboardResponse

from app.db.models.subscription import Subscription
from app.schemas.subscription import SubscriptionResponse
from app.schemas.subscription import SubscriptionPlanResponse

from datetime import datetime
from app.db.models.topic import Topic
from app.db.models.subscription import Subscription


from app.schemas.payment import CreateOrderRequest, CreateOrderResponse
from app.services.payment_service import create_razorpay_order

from datetime import timedelta

from app.db.models.payment import Payment
from app.services.payment_service import verify_razorpay_payment
from app.schemas.payment import VerifyPaymentRequest, VerifyPaymentResponse

from app.services.subscription_service import has_active_subscription

from app.db.models.practice_session import PracticeSession
from app.db.models.practice_session_question import PracticeSessionQuestion
from app.schemas.practice_session import (
    PracticeSessionCreate,
    PracticeSessionResponse,
)

from app.services.recommendation_service import get_recommended_questions
from app.schemas.recommendation import RecommendedQuestionResponse

from app.schemas.practice_session import SessionSubmitRequest, SessionSubmitResponse
from app.db.models.question_option import QuestionOption

from app.schemas.practice_session import PracticeSessionResponse
from app.services.progress_service import update_progress_after_attempt

from app.schemas.practice_session import PracticeSessionResultResponse

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

@router.get("/questions", response_model=list[PracticeQuestionResponse])
async def get_practice_questions(
    topic_id: int | None = None,
    subtopic_id: int | None = None,
    difficulty: int | None = None,
    question_type: str | None = None,
    source_type: str | None = None,
    company_year: int | None = None,
    limit: int = 10,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 50",
        )

    # -----------------------------------------
    # Check subscription
    # -----------------------------------------
    has_subscription = await has_active_subscription(
        db,
        current_user.id,
    )

    # -----------------------------------------
    # DSA check
    # -----------------------------------------
    if topic_id is not None:
        result = await db.execute(
            select(Topic).where(
                Topic.id == topic_id,
                Topic.is_active == True,
            )
        )

        topic = result.scalar_one_or_none()

        if not topic:
            raise HTTPException(
                status_code=404,
                detail="Topic not found",
            )

        if topic.category.upper() == "DSA" and not has_subscription:
            raise HTTPException(
                status_code=403,
                detail="DSA questions require an active subscription",
            )

    # -----------------------------------------
    # Get questions already attempted by user
    # -----------------------------------------
    attempted_question_ids = set()

    if topic_id is not None and not has_subscription:
        result = await db.execute(
            select(Attempt.question_id)
            .join(
                Question,
                Attempt.question_id == Question.id,
            )
            .where(
                Attempt.user_id == current_user.id,
                Question.topic_id == topic_id,
            )
            .distinct()
        )

        attempted_question_ids = set(
            result.scalars().all()
        )

        # -----------------------------------------
        # Free limit
        # -----------------------------------------
        unique_attempted_count = len(attempted_question_ids)

        remaining_free = 5 - unique_attempted_count

        if remaining_free <= 0:
            raise HTTPException(
                status_code=403,
                detail="Free limit reached. Please subscribe to continue.",
            )

        limit = min(limit, remaining_free)

    # -----------------------------------------
    # Build question query
    # -----------------------------------------
    query = (
        select(Question)
        .options(selectinload(Question.options))
        .where(
            Question.is_active == True
        )
    )

    if topic_id is not None:
        query = query.where(
            Question.topic_id == topic_id
        )

    if subtopic_id is not None:
        query = query.where(
            Question.subtopic_id == subtopic_id
        )

    if difficulty is not None:
        query = query.where(
            Question.difficulty == difficulty
        )

    if question_type is not None:
        query = query.where(
            Question.question_type == question_type
        )

    if source_type is not None:
        query = query.where(
            Question.source_type == source_type
        )

    if company_year is not None:
        query = query.where(
            Question.company_year == company_year
        )

    # -----------------------------------------
    # Free users get only new questions
    # -----------------------------------------
    if not has_subscription and attempted_question_ids:
        query = query.where(
            ~Question.id.in_(attempted_question_ids)
        )

    query = (
        query
        .order_by(Question.id.desc())
        .limit(limit)
    )

    result = await db.execute(query)

    return result.scalars().all()

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

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # -------------------------
    # Overall progress
    # -------------------------
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id
        )
    )

    progress = result.scalar_one_or_none()

    if progress:
        total_questions = progress.questions_solved
        correct_answers = progress.correct_answers
        wrong_answers = progress.wrong_answers
        streak_days = progress.streak_days

        accuracy = 0.0

        if total_questions > 0:
            accuracy = round(
                (correct_answers / total_questions) * 100,
                2,
            )
    else:
        total_questions = 0
        correct_answers = 0
        wrong_answers = 0
        streak_days = 0
        accuracy = 0.0

    # -------------------------
    # Topic progress
    # -------------------------
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

    topic_rows = result.all()

    topic_progress = []

    for topic_data, topic_name in topic_rows:

        topic_accuracy = 0.0

        if topic_data.questions_solved > 0:
            topic_accuracy = round(
                (
                    topic_data.correct_answers
                    / topic_data.questions_solved
                ) * 100,
                2,
            )

        topic_progress.append(
            {
                "topic_id": topic_data.topic_id,
                "topic_name": topic_name,
                "questions_solved": topic_data.questions_solved,
                "correct_answers": topic_data.correct_answers,
                "wrong_answers": topic_data.wrong_answers,
                "accuracy": topic_accuracy,
            }
        )

    # -------------------------
    # Recent attempts
    # -------------------------
    result = await db.execute(
        select(Attempt, Question.question_text)
        .join(
            Question,
            Attempt.question_id == Question.id,
        )
        .where(
            Attempt.user_id == current_user.id
        )
        .order_by(
            Attempt.attempted_at.desc()
        )
        .limit(10)
    )

    attempt_rows = result.all()

    recent_attempts = []

    for attempt, question_text in attempt_rows:
        recent_attempts.append(
            {
                "attempt_id": attempt.id,
                "question_id": attempt.question_id,
                "question_text": question_text,
                "is_correct": attempt.is_correct,
                "time_taken_seconds": attempt.time_taken_seconds,
                "attempted_at": attempt.attempted_at,
            }
        )

    # -------------------------
    # Final dashboard response
    # -------------------------
    return {
        "user_name": current_user.name,
        "total_questions_solved": total_questions,
        "correct_answers": correct_answers,
        "wrong_answers": wrong_answers,
        "accuracy": accuracy,
        "streak_days": streak_days,
        "topic_progress": topic_progress,
        "recent_attempts": recent_attempts,
    }

@router.get("/subscription", response_model=SubscriptionResponse | None)
async def get_my_subscription(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription)
        .where(
            Subscription.user_id == current_user.id,
            Subscription.is_active == True,
        )
        .order_by(Subscription.expires_at.desc())
    )

    subscription = result.scalars().first()

    return subscription

@router.get("/subscription/plans", response_model=list[SubscriptionPlanResponse])
async def get_subscription_plans():
    return [
        {
            "plan": "1_month",
            "amount": 149,
            "duration_days": 30,
            "description": "30 days of premium access",
        },
        {
            "plan": "2_months",
            "amount": 249,
            "duration_days": 60,
            "description": "60 days of premium access",
        },
        {
            "plan": "3_months",
            "amount": 349,
            "duration_days": 90,
            "description": "90 days of premium access",
        },
    ]

@router.post("/subscription/create-order", response_model=CreateOrderResponse)
async def create_subscription_order(
    data: CreateOrderRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.plan not in PLANS:
        raise HTTPException(
            status_code=400,
            detail="Invalid subscription plan",
        )

    try:
        order = create_razorpay_order(data.plan)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to create Razorpay order",
        )

    amount = PLANS[data.plan]["amount"]

    # Save payment order in database
    payment = Payment(
        user_id=current_user.id,
        subscription_id=None,
        amount=amount,
        razorpay_order_id=order["id"],
        razorpay_payment_id=None,
        signature=None,
        status="created",
    )

    db.add(payment)
    await db.commit()

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        "plan": data.plan,
    }

@router.post(
    "/subscription/verify-payment",
    response_model=VerifyPaymentResponse,
)
async def verify_payment(
    data: VerifyPaymentRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate plan
    if data.plan not in PLANS:
        raise HTTPException(
            status_code=400,
            detail="Invalid subscription plan",
        )

    plan_data = PLANS[data.plan]

    # Find payment order
    result = await db.execute(
        select(Payment).where(
            Payment.razorpay_order_id == data.razorpay_order_id,
            Payment.user_id == current_user.id,
        )
    )

    payment_record = result.scalar_one_or_none()

    if not payment_record:
        raise HTTPException(
            status_code=404,
            detail="Payment order not found",
        )

    # Prevent already processed order
    if payment_record.status == "success":
        raise HTTPException(
            status_code=400,
            detail="Payment already processed",
        )

    # Verify amount
    if payment_record.amount != plan_data["amount"]:
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match selected plan",
        )

    # Verify Razorpay signature
    is_valid = verify_razorpay_payment(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature,
    )

    if not is_valid:
        payment_record.status = "failed"
        await db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment verification failed",
        )

    # Check duplicate payment ID
    result = await db.execute(
        select(Payment).where(
            Payment.razorpay_payment_id
            == data.razorpay_payment_id
        )
    )

    existing_payment = result.scalar_one_or_none()

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment already processed",
        )

    # Deactivate existing subscription
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.is_active == True,
        )
    )

    old_subscription = result.scalars().first()

    if old_subscription:
        old_subscription.is_active = False

    # Create new subscription
    now = datetime.utcnow()

    subscription = Subscription(
        user_id=current_user.id,
        plan=data.plan,
        amount=plan_data["amount"],
        starts_at=now,
        expires_at=now + timedelta(
            days=plan_data["duration_days"]
        ),
        is_active=True,
    )

    db.add(subscription)
    await db.flush()

    # Update payment
    payment_record.subscription_id = subscription.id
    payment_record.razorpay_payment_id = data.razorpay_payment_id
    payment_record.signature = data.razorpay_signature
    payment_record.status = "success"

    await db.commit()
    await db.refresh(subscription)

    return {
        "message": "Payment verified and subscription activated",
        "subscription_id": subscription.id,
        "plan": subscription.plan,
        "expires_at": subscription.expires_at,
    }

@router.post(
    "/session/start",
    response_model=PracticeSessionResponse,
)
async def start_practice_session(
    data: PracticeSessionCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.topic_id is not None:
        result = await db.execute(
            select(Topic).where(
                Topic.id == data.topic_id,
                Topic.is_active == True,
            )
        )

        topic = result.scalar_one_or_none()

        if not topic:
            raise HTTPException(
                status_code=404,
                detail="Topic not found",
            )

        has_subscription = await has_active_subscription(
            db,
            current_user.id,
        )

        if topic.category.upper() == "DSA" and not has_subscription:
            raise HTTPException(
                status_code=403,
                detail="DSA practice requires an active subscription",
            )

    # Check subscription
    has_subscription = await has_active_subscription(
        db,
        current_user.id,
    )

    # -----------------------------------------
    # Build question query
    # -----------------------------------------
    query = (
        select(Question.id)
        .where(
            Question.is_active == True,
        )
    )

    if data.topic_id is not None:
        query = query.where(
            Question.topic_id == data.topic_id
        )

    # -----------------------------------------
    # Free user → only unattempted questions
    # -----------------------------------------
    if not has_subscription:

        result = await db.execute(
            select(Attempt.question_id)
            .join(
                Question,
                Attempt.question_id == Question.id,
            )
            .where(
                Attempt.user_id == current_user.id,
            )
            .distinct()
        )

        attempted_ids = set(
            result.scalars().all()
        )

        if attempted_ids:
            query = query.where(
                ~Question.id.in_(attempted_ids)
            )

    # -----------------------------------------
    # Random questions
    # -----------------------------------------
    query = query.order_by(func.random()).limit(
        data.total_questions
    )

    result = await db.execute(query)

    question_ids = result.scalars().all()

    if len(question_ids) < data.total_questions:
        raise HTTPException(
            status_code=400,
            detail=f"Only {len(question_ids)} questions are available",
        )

    # -----------------------------------------
    # Create session
    # -----------------------------------------
    session = PracticeSession(
        user_id=current_user.id,
        topic_id=data.topic_id,
        total_questions=data.total_questions,
        status="active",
        score=0,
    )

    db.add(session)
    await db.flush()

    # -----------------------------------------
    # Add questions to session
    # -----------------------------------------
    for index, question_id in enumerate(question_ids, start=1):

        session_question = PracticeSessionQuestion(
            session_id=session.id,
            question_id=question_id,
            question_order=index,
        )

        db.add(session_question)

    await db.commit()

    # -----------------------------------------
    # Reload session
    # -----------------------------------------
    result = await db.execute(
        select(PracticeSession)
        .options(
            selectinload(
                PracticeSession.questions
            )
        )
        .where(
            PracticeSession.id == session.id
        )
    )

    session = result.scalar_one()

    return session

@router.post(
    "/session/{session_id}/submit",
    response_model=SessionSubmitResponse,
)
async def submit_session_question(
    session_id: int,
    data: SessionSubmitRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Find session
    result = await db.execute(
        select(PracticeSession).where(
            PracticeSession.id == session_id,
            PracticeSession.user_id == current_user.id,
        )
    )

    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Practice session not found",
        )

    if session.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Practice session is already completed",
        )

    # Find session question
    result = await db.execute(
        select(PracticeSessionQuestion).where(
            PracticeSessionQuestion.session_id == session_id,
            PracticeSessionQuestion.question_id == data.question_id,
        )
    )

    session_question = result.scalar_one_or_none()

    if not session_question:
        raise HTTPException(
            status_code=404,
            detail="Question does not belong to this session",
        )

    # Prevent duplicate submission
    if session_question.answered_at is not None:
        raise HTTPException(
            status_code=400,
            detail="Question already answered",
        )

    # No option selected
    if data.selected_option_id is None:
        session_question.selected_option_id = None
        session_question.is_correct = False
        session_question.time_taken_seconds = data.time_taken_seconds
        session_question.answered_at = datetime.utcnow()

        await db.commit()

        return {
            "question_id": data.question_id,
            "selected_option_id": None,
            "is_correct": False,
            "score": session.score,
        }

    # Validate selected option
    result = await db.execute(
        select(QuestionOption).where(
            QuestionOption.id == data.selected_option_id,
            QuestionOption.question_id == data.question_id,
        )
    )

    option = result.scalar_one_or_none()

    if not option:
        raise HTTPException(
            status_code=400,
            detail="Invalid option for this question",
        )

    is_correct = option.is_correct

    # Update session question
    session_question.selected_option_id = data.selected_option_id
    session_question.is_correct = is_correct
    session_question.time_taken_seconds = data.time_taken_seconds
    session_question.answered_at = datetime.utcnow()

    # Update score
    if is_correct:
        session.score += 1

    await db.commit()

    return {
        "question_id": data.question_id,
        "selected_option_id": data.selected_option_id,
        "is_correct": is_correct,
        "score": session.score,
    }

@router.get(
    "/session/{session_id}",
    response_model=PracticeSessionResponse,
)
async def get_practice_session(
    session_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PracticeSession)
        .options(
            selectinload(
                PracticeSession.questions
            )
        )
        .where(
            PracticeSession.id == session_id,
            PracticeSession.user_id == current_user.id,
        )
    )

    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Practice session not found",
        )

    return session

@router.post("/session/{session_id}/finish")
async def finish_practice_session(
    session_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Find session
    result = await db.execute(
        select(PracticeSession)
        .options(
            selectinload(PracticeSession.questions)
        )
        .where(
            PracticeSession.id == session_id,
            PracticeSession.user_id == current_user.id,
        )
    )

    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Practice session not found",
        )

    if session.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Practice session already completed",
        )

    # -----------------------------------------
    # Create Attempts
    # -----------------------------------------
    for session_question in session.questions:

        # Only answered questions
        if session_question.answered_at is None:
            continue

        attempt = Attempt(
            user_id=current_user.id,
            question_id=session_question.question_id,
            selected_option_id=session_question.selected_option_id,
            is_correct=session_question.is_correct or False,
            time_taken_seconds=session_question.time_taken_seconds,
            attempted_at=session_question.answered_at,
        )

        db.add(attempt)

        await db.flush()

        # Update global + topic progress
        await update_progress_after_attempt(
            db,
            attempt,
        )

    # -----------------------------------------
    # Complete session
    # -----------------------------------------
    session.status = "completed"
    session.completed_at = datetime.utcnow()

    await db.commit()

    return {
        "message": "Practice session completed",
        "session_id": session.id,
        "total_questions": session.total_questions,
        "score": session.score,
        "status": session.status,
        "completed_at": session.completed_at,
    }

@router.get(
    "/session/{session_id}/result",
    response_model=PracticeSessionResultResponse,
)
async def get_session_result(
    session_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PracticeSession)
        .options(
            selectinload(
                PracticeSession.questions
            )
        )
        .where(
            PracticeSession.id == session_id,
            PracticeSession.user_id == current_user.id,
        )
    )

    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Practice session not found",
        )

    if session.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Practice session is not completed",
        )

    questions = session.questions

    answered_questions = sum(
        1
        for question in questions
        if question.answered_at is not None
    )

    correct_answers = sum(
        1
        for question in questions
        if question.is_correct is True
    )

    wrong_answers = sum(
        1
        for question in questions
        if question.answered_at is not None
        and question.is_correct is False
    )

    unanswered_questions = (
        session.total_questions - answered_questions
    )

    accuracy = 0.0

    if answered_questions > 0:
        accuracy = round(
            (correct_answers / answered_questions) * 100,
            2,
        )

    total_time_seconds = sum(
        question.time_taken_seconds or 0
        for question in questions
    )

    question_results = [
        {
            "question_id": question.question_id,
            "question_order": question.question_order,
            "selected_option_id": question.selected_option_id,
            "is_correct": question.is_correct,
            "time_taken_seconds": question.time_taken_seconds,
        }
        for question in sorted(
            questions,
            key=lambda x: x.question_order,
        )
    ]

    return {
        "session_id": session.id,
        "total_questions": session.total_questions,
        "answered_questions": answered_questions,
        "correct_answers": correct_answers,
        "wrong_answers": wrong_answers,
        "unanswered_questions": unanswered_questions,
        "score": session.score,
        "accuracy": accuracy,
        "total_time_seconds": total_time_seconds,
        "status": session.status,
        "questions": question_results,
    }

@router.get(
    "/recommendations",
    response_model=list[RecommendedQuestionResponse],
)
async def get_recommendations(
    limit: int = 10,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if limit < 1 or limit > 20:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 20",
        )

    recommended = await get_recommended_questions(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )

    return [
        RecommendedQuestionResponse(
            id=question.id,
            topic_id=question.topic_id,
            subtopic_id=question.subtopic_id,
            question_text=question.question_text,
            difficulty=question.difficulty,
            question_type=question.question_type,
            source_type=question.source_type,
            company_year=question.company_year,
            reason=reason,
        )
        for question, reason in recommended
    ]