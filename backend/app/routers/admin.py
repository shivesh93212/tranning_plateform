from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.admin_analytics import AdminAnalyticsResponse
from app.db.database import get_db

from app.dependencies.auth import get_current_user
from app.db.models.user import User
from app.schemas.topic import (
    TopicCreate,
    TopicUpdate,
    TopicResponse,
)
from app.services.admin_service import require_admin

from app.db.models.company import Company

from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
)
from app.db.models.subtopic import Subtopic


from app.schemas.subtopic import (
    SubtopicCreate,
    SubtopicUpdate,
    SubtopicResponse,
)

from app.db.models.question import Question
from app.db.models.question_option import QuestionOption
from app.db.models.topic import Topic
from app.db.models.subtopic import Subtopic

from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
)

from sqlalchemy import func


from app.db.models.attempt import Attempt
from app.db.models.subscription import Subscription
from app.db.models.payment import Payment

from app.schemas.admin_dashboard import AdminDashboardResponse

from app.schemas.admin import AdminUserResponse, AdminUserStatusUpdate

from sqlalchemy.orm import selectinload
from app.schemas.admin_billing import (
    AdminSubscriptionResponse,
    AdminPaymentResponse,
)


router = APIRouter()


# =========================
# CREATE TOPIC
# =========================

@router.post(
    "/topics",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_topic(
    data: TopicCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    # Check duplicate name
    result = await db.execute(
        select(Topic).where(Topic.name == data.name)
    )

    existing_topic = result.scalar_one_or_none()

    if existing_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic with this name already exists",
        )

    # Check duplicate slug
    result = await db.execute(
        select(Topic).where(Topic.slug == data.slug)
    )

    existing_slug = result.scalar_one_or_none()

    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic with this slug already exists",
        )

    topic = Topic(
        name=data.name,
        slug=data.slug,
        category=data.category,
        description=data.description,
        is_active=True,
    )

    db.add(topic)

    await db.commit()
    await db.refresh(topic)

    return topic


# =========================
# GET ALL TOPICS
# =========================

@router.get(
    "/topics",
    response_model=list[TopicResponse],
)
async def get_topics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Topic).order_by(Topic.id.desc())
    )

    topics = result.scalars().all()

    return topics


# =========================
# GET SINGLE TOPIC
# =========================

@router.get(
    "/topics/{topic_id}",
    response_model=TopicResponse,
)
async def get_topic(
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Topic).where(Topic.id == topic_id)
    )

    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )

    return topic


# =========================
# UPDATE TOPIC
# =========================

@router.patch(
    "/topics/{topic_id}",
    response_model=TopicResponse,
)
async def update_topic(
    topic_id: int,
    data: TopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Topic).where(Topic.id == topic_id)
    )

    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )

    # Check duplicate name
    if data.name is not None and data.name != topic.name:

        result = await db.execute(
            select(Topic).where(
                Topic.name == data.name,
                Topic.id != topic_id,
            )
        )

        existing_topic = result.scalar_one_or_none()

        if existing_topic:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Topic with this name already exists",
            )

        topic.name = data.name

    # Check duplicate slug
    if data.slug is not None and data.slug != topic.slug:

        result = await db.execute(
            select(Topic).where(
                Topic.slug == data.slug,
                Topic.id != topic_id,
            )
        )

        existing_slug = result.scalar_one_or_none()

        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Topic with this slug already exists",
            )

        topic.slug = data.slug

    if data.category is not None:
        topic.category = data.category

    if data.description is not None:
        topic.description = data.description

    if data.is_active is not None:
        topic.is_active = data.is_active

    await db.commit()
    await db.refresh(topic)

    return topic


# =========================
# DEACTIVATE TOPIC
# =========================

@router.delete(
    "/topics/{topic_id}",
)
async def delete_topic(
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Topic).where(Topic.id == topic_id)
    )

    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )

    topic.is_active = False

    await db.commit()

    return {
        "message": "Topic deactivated successfully"
    }


# =========================
# CREATE SUBTOPIC
# =========================

@router.post(
    "/subtopics",
    response_model=SubtopicResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_subtopic(
    data: SubtopicCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    # Check topic exists
    result = await db.execute(
        select(Topic).where(
            Topic.id == data.topic_id,
            Topic.is_active == True,
        )
    )

    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found or inactive",
        )

    # Check duplicate slug
    result = await db.execute(
        select(Subtopic).where(
            Subtopic.slug == data.slug
        )
    )

    existing_subtopic = result.scalar_one_or_none()

    if existing_subtopic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subtopic with this slug already exists",
        )

    subtopic = Subtopic(
        topic_id=data.topic_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        is_active=True,
    )

    db.add(subtopic)

    await db.commit()
    await db.refresh(subtopic)

    return subtopic

# =========================
# GET ALL SUBTOPICS
# =========================

@router.get(
    "/subtopics",
    response_model=list[SubtopicResponse],
)
async def get_subtopics(
    topic_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    query = select(Subtopic)

    if topic_id is not None:
        query = query.where(
            Subtopic.topic_id == topic_id
        )

    query = query.order_by(Subtopic.id.desc())

    result = await db.execute(query)

    subtopics = result.scalars().all()

    return subtopics

# =========================
# GET SINGLE SUBTOPIC
# =========================

@router.get(
    "/subtopics/{subtopic_id}",
    response_model=SubtopicResponse,
)
async def get_subtopic(
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Subtopic).where(
            Subtopic.id == subtopic_id
        )
    )

    subtopic = result.scalar_one_or_none()

    if not subtopic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtopic not found",
        )

    return subtopic

# =========================
# UPDATE SUBTOPIC
# =========================

@router.patch(
    "/subtopics/{subtopic_id}",
    response_model=SubtopicResponse,
)
async def update_subtopic(
    subtopic_id: int,
    data: SubtopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Subtopic).where(
            Subtopic.id == subtopic_id
        )
    )

    subtopic = result.scalar_one_or_none()

    if not subtopic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtopic not found",
        )

    # Change topic
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
                status_code=status.HTTP_404_NOT_FOUND,
                detail="New topic not found or inactive",
            )

        subtopic.topic_id = data.topic_id

    # Change name
    if data.name is not None:
        subtopic.name = data.name

    # Change slug
    if data.slug is not None and data.slug != subtopic.slug:

        result = await db.execute(
            select(Subtopic).where(
                Subtopic.slug == data.slug,
                Subtopic.id != subtopic_id,
            )
        )

        existing_subtopic = result.scalar_one_or_none()

        if existing_subtopic:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subtopic with this slug already exists",
            )

        subtopic.slug = data.slug

    # Change description
    if data.description is not None:
        subtopic.description = data.description

    # Activate / deactivate
    if data.is_active is not None:
        subtopic.is_active = data.is_active

    await db.commit()
    await db.refresh(subtopic)

    return subtopic

# =========================
# DEACTIVATE SUBTOPIC
# =========================

@router.delete(
    "/subtopics/{subtopic_id}",
)
async def delete_subtopic(
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Subtopic).where(
            Subtopic.id == subtopic_id
        )
    )

    subtopic = result.scalar_one_or_none()

    if not subtopic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtopic not found",
        )

    subtopic.is_active = False

    await db.commit()

    return {
        "message": "Subtopic deactivated successfully"
    }

# =========================
# CREATE COMPANY
# =========================

@router.post(
    "/companies",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_company(
    data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    # Check duplicate name
    result = await db.execute(
        select(Company).where(
            Company.name == data.name
        )
    )

    existing_company = result.scalar_one_or_none()

    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists",
        )

    # Check duplicate slug
    result = await db.execute(
        select(Company).where(
            Company.slug == data.slug
        )
    )

    existing_slug = result.scalar_one_or_none()

    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this slug already exists",
        )

    company = Company(
        name=data.name,
        slug=data.slug,
        description=data.description,
        is_active=True,
    )

    db.add(company)

    await db.commit()
    await db.refresh(company)

    return company

# =========================
# GET ALL COMPANIES
# =========================

@router.get(
    "/companies",
    response_model=list[CompanyResponse],
)
async def get_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Company).order_by(
            Company.id.desc()
        )
    )

    companies = result.scalars().all()

    return companies

# =========================
# GET SINGLE COMPANY
# =========================

@router.get(
    "/companies/{company_id}",
    response_model=CompanyResponse,
)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Company).where(
            Company.id == company_id
        )
    )

    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return company

# =========================
# UPDATE COMPANY
# =========================

@router.patch(
    "/companies/{company_id}",
    response_model=CompanyResponse,
)
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Company).where(
            Company.id == company_id
        )
    )

    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    # Update name
    if data.name is not None and data.name != company.name:

        result = await db.execute(
            select(Company).where(
                Company.name == data.name,
                Company.id != company_id,
            )
        )

        existing_company = result.scalar_one_or_none()

        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this name already exists",
            )

        company.name = data.name

    # Update slug
    if data.slug is not None and data.slug != company.slug:

        result = await db.execute(
            select(Company).where(
                Company.slug == data.slug,
                Company.id != company_id,
            )
        )

        existing_slug = result.scalar_one_or_none()

        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this slug already exists",
            )

        company.slug = data.slug

    # Update description
    if data.description is not None:
        company.description = data.description

    # Activate / deactivate
    if data.is_active is not None:
        company.is_active = data.is_active

    await db.commit()
    await db.refresh(company)

    return company

# =========================
# DEACTIVATE COMPANY
# =========================

@router.delete(
    "/companies/{company_id}",
)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Company).where(
            Company.id == company_id
        )
    )

    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    company.is_active = False

    await db.commit()

    return {
        "message": "Company deactivated successfully"
    }

# =========================
# CREATE QUESTION
# =========================

@router.post(
    "/questions",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_question(
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    # -------------------------
    # Check Topic
    # -------------------------

    result = await db.execute(
        select(Topic).where(
            Topic.id == data.topic_id,
            Topic.is_active == True,
        )
    )

    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found or inactive",
        )

    # -------------------------
    # Check Subtopic
    # -------------------------

    result = await db.execute(
        select(Subtopic).where(
            Subtopic.id == data.subtopic_id,
            Subtopic.is_active == True,
        )
    )

    subtopic = result.scalar_one_or_none()

    if not subtopic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtopic not found or inactive",
        )

    # -------------------------
    # Check Subtopic belongs
    # to selected Topic
    # -------------------------

    if subtopic.topic_id != data.topic_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subtopic does not belong to the selected topic",
        )

    # -------------------------
    # Validate Options
    # -------------------------

    if len(data.options) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 options are required",
        )

    # Check duplicate labels
    labels = [
        option.option_label.upper()
        for option in data.options
    ]

    if len(labels) != len(set(labels)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate option labels are not allowed",
        )

    # Check exactly one correct answer
    correct_options = [
        option
        for option in data.options
        if option.is_correct
    ]

    if len(correct_options) != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exactly one correct option is required",
        )

    # -------------------------
    # Create Question
    # -------------------------

    question = Question(
        topic_id=data.topic_id,
        subtopic_id=data.subtopic_id,
        question_text=data.question_text,
        difficulty=data.difficulty,
        question_type=data.question_type,
        source_type=data.source_type,
        company_year=data.company_year,
        explanation=data.explanation,
        shortcut=data.shortcut,
        solution_steps=data.solution_steps,
        is_active=True,
    )

    db.add(question)

    await db.flush()

    # -------------------------
    # Create Options
    # -------------------------

    for option_data in data.options:

        option = QuestionOption(
            question_id=question.id,
            option_text=option_data.option_text,
            option_label=option_data.option_label.upper(),
            is_correct=option_data.is_correct,
        )

        db.add(option)

    await db.commit()

    await db.refresh(question)

    return question


# =========================
# GET ALL QUESTIONS
# =========================

@router.get(
    "/questions",
    response_model=list[QuestionResponse],
)
async def get_questions(
    topic_id: int | None = None,
    subtopic_id: int | None = None,
    difficulty: int | None = None,
    question_type: str | None = None,
    source_type: str | None = None,
    company_year: int | None = None,
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    query = (
        select(Question)
        .options(
            selectinload(Question.options)
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
        query = query.where(
            Question.difficulty == difficulty
        )

    # Question type filter
    if question_type is not None:
        query = query.where(
            Question.question_type == question_type
        )

    # Source type filter
    if source_type is not None:
        query = query.where(
            Question.source_type == source_type
        )

    # Company year filter
    if company_year is not None:
        query = query.where(
            Question.company_year == company_year
        )

    # Active / inactive filter
    if is_active is not None:
        query = query.where(
            Question.is_active == is_active
        )

    query = query.order_by(
        Question.id.desc()
    )

    result = await db.execute(query)

    questions = result.scalars().unique().all()

    return questions

# =========================
# GET SINGLE QUESTION
# =========================

@router.get(
    "/questions/{question_id}",
    response_model=QuestionResponse,
)
async def get_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Question)
        .options(
            selectinload(Question.options)
        )
        .where(
            Question.id == question_id
        )
    )

    question = result.scalar_one_or_none()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    return question

# =========================
# UPDATE QUESTION
# =========================

@router.patch(
    "/questions/{question_id}",
    response_model=QuestionResponse,
)
async def update_question(
    question_id: int,
    data: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    # -------------------------
    # Get question
    # -------------------------

    result = await db.execute(
        select(Question)
        .options(
            selectinload(Question.options)
        )
        .where(
            Question.id == question_id
        )
    )

    question = result.scalar_one_or_none()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    # -------------------------
    # Validate Topic
    # -------------------------

    new_topic_id = (
        data.topic_id
        if data.topic_id is not None
        else question.topic_id
    )

    result = await db.execute(
        select(Topic).where(
            Topic.id == new_topic_id,
            Topic.is_active == True,
        )
    )

    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found or inactive",
        )

    # -------------------------
    # Validate Subtopic
    # -------------------------

    new_subtopic_id = (
        data.subtopic_id
        if data.subtopic_id is not None
        else question.subtopic_id
    )

    result = await db.execute(
        select(Subtopic).where(
            Subtopic.id == new_subtopic_id,
            Subtopic.is_active == True,
        )
    )

    subtopic = result.scalar_one_or_none()

    if not subtopic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtopic not found or inactive",
        )

    # -------------------------
    # Check relationship
    # -------------------------

    if subtopic.topic_id != new_topic_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subtopic does not belong to the selected topic",
        )

    # -------------------------
    # Update basic fields
    # -------------------------

    if data.topic_id is not None:
        question.topic_id = data.topic_id

    if data.subtopic_id is not None:
        question.subtopic_id = data.subtopic_id

    if data.question_text is not None:
        question.question_text = data.question_text

    if data.difficulty is not None:
        question.difficulty = data.difficulty

    if data.question_type is not None:
        question.question_type = data.question_type

    if data.source_type is not None:
        question.source_type = data.source_type

    if data.company_year is not None:
        question.company_year = data.company_year

    if data.explanation is not None:
        question.explanation = data.explanation

    if data.shortcut is not None:
        question.shortcut = data.shortcut

    if data.solution_steps is not None:
        question.solution_steps = data.solution_steps

    if data.is_active is not None:
        question.is_active = data.is_active

    # -------------------------
    # Update options
    # -------------------------

    if data.options is not None:

        if len(data.options) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least 2 options are required",
            )

        labels = [
            option.option_label.upper()
            for option in data.options
        ]

        if len(labels) != len(set(labels)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate option labels are not allowed",
            )

        correct_options = [
            option
            for option in data.options
            if option.is_correct
        ]

        if len(correct_options) != 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exactly one correct option is required",
            )

        # Remove old options
        for option in list(question.options):
            await db.delete(option)

        await db.flush()

        # Create new options
        for option_data in data.options:

            option = QuestionOption(
                question_id=question.id,
                option_text=option_data.option_text,
                option_label=option_data.option_label.upper(),
                is_correct=option_data.is_correct,
            )

            db.add(option)

    await db.commit()

    # Reload question with options
    result = await db.execute(
        select(Question)
        .options(
            selectinload(Question.options)
        )
        .where(
            Question.id == question_id
        )
    )

    question = result.scalar_one()

    return question

# =========================
# DEACTIVATE QUESTION
# =========================

@router.delete(
    "/questions/{question_id}",
)
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    result = await db.execute(
        select(Question).where(
            Question.id == question_id
        )
    )

    question = result.scalar_one_or_none()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    question.is_active = False

    await db.commit()

    return {
        "message": "Question deactivated successfully"
    }

@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse,
)
async def get_admin_dashboard(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    total_users = await db.scalar(
        select(func.count(User.id))
    )

    active_users = await db.scalar(
        select(func.count(User.id)).where(
            User.is_active == True
        )
    )

    total_topics = await db.scalar(
        select(func.count(Topic.id))
    )

    total_subtopics = await db.scalar(
        select(func.count(Subtopic.id))
    )

    total_questions = await db.scalar(
        select(func.count(Question.id))
    )

    active_questions = await db.scalar(
        select(func.count(Question.id)).where(
            Question.is_active == True
        )
    )

    total_attempts = await db.scalar(
        select(func.count(Attempt.id))
    )

    total_subscriptions = await db.scalar(
        select(func.count(Subscription.id))
    )

    successful_payments = await db.scalar(
        select(func.count(Payment.id)).where(
            Payment.status == "success"
        )
    )

    total_revenue = await db.scalar(
        select(
            func.coalesce(
                func.sum(Payment.amount),
                0,
            )
        ).where(
            Payment.status == "success"
        )
    )

    return {
        "total_users": total_users or 0,
        "active_users": active_users or 0,
        "total_topics": total_topics or 0,
        "total_subtopics": total_subtopics or 0,
        "total_questions": total_questions or 0,
        "active_questions": active_questions or 0,
        "total_attempts": total_attempts or 0,
        "total_subscriptions": total_subscriptions or 0,
        "successful_payments": successful_payments or 0,
        "total_revenue": float(total_revenue or 0),
    }

@router.get(
    "/users",
    response_model=list[AdminUserResponse],
)
async def get_all_users(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )

    return result.scalars().all()

@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse,
)
async def get_user_by_id(
    user_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    result = await db.execute(
        select(User).where(
            User.id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user

@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserResponse,
)
async def update_user_status(
    user_id: int,
    data: AdminUserStatusUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot change their own status",
        )

    result = await db.execute(
        select(User).where(
            User.id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.is_active = data.is_active

    await db.commit()
    await db.refresh(user)

    return user

@router.get("/subscriptions", response_model=list[AdminSubscriptionResponse])
async def get_all_subscriptions(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    result = await db.execute(
        select(Subscription, User)
        .join(User, Subscription.user_id == User.id)
        .order_by(Subscription.created_at.desc())
    )

    rows = result.all()

    return [
        AdminSubscriptionResponse(
            id=subscription.id,
            user_id=subscription.user_id,
            user_name=user.name,
            user_email=user.email,
            plan=subscription.plan,
            amount=subscription.amount,
            starts_at=subscription.starts_at,
            expires_at=subscription.expires_at,
            is_active=subscription.is_active,
            created_at=subscription.created_at,
        )
        for subscription, user in rows
    ]

@router.get("/payments", response_model=list[AdminPaymentResponse])
async def get_all_payments(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    result = await db.execute(
        select(Payment, User)
        .join(User, Payment.user_id == User.id)
        .order_by(Payment.created_at.desc())
    )

    rows = result.all()

    return [
        AdminPaymentResponse(
            id=payment.id,
            user_id=payment.user_id,
            user_name=user.name,
            user_email=user.email,
            subscription_id=payment.subscription_id,
            amount=payment.amount,
            razorpay_order_id=payment.razorpay_order_id,
            razorpay_payment_id=payment.razorpay_payment_id,
            status=payment.status,
            created_at=payment.created_at,
        )
        for payment, user in rows
    ]

@router.get(
    "/users/{user_id}/subscription",
    response_model=AdminSubscriptionResponse | None,
)
async def get_user_subscription(
    user_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    result = await db.execute(
        select(Subscription, User)
        .join(User, Subscription.user_id == User.id)
        .where(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
    )

    row = result.first()

    if not row:
        return None

    subscription, user = row

    return AdminSubscriptionResponse(
        id=subscription.id,
        user_id=subscription.user_id,
        user_name=user.name,
        user_email=user.email,
        plan=subscription.plan,
        amount=subscription.amount,
        starts_at=subscription.starts_at,
        expires_at=subscription.expires_at,
        is_active=subscription.is_active,
        created_at=subscription.created_at,
    )

@router.get("/analytics", response_model=AdminAnalyticsResponse)
async def get_admin_analytics(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    total_attempts = await db.scalar(
        select(func.count(Attempt.id))
    )

    correct_attempts = await db.scalar(
        select(func.count(Attempt.id))
        .where(Attempt.is_correct == True)
    )

    wrong_attempts = await db.scalar(
        select(func.count(Attempt.id))
        .where(Attempt.is_correct == False)
    )

    active_users = await db.scalar(
        select(func.count(User.id))
        .where(User.is_active == True)
    )

    inactive_users = await db.scalar(
        select(func.count(User.id))
        .where(User.is_active == False)
    )

    total_questions = await db.scalar(
        select(func.count(Question.id))
    )

    active_questions = await db.scalar(
        select(func.count(Question.id))
        .where(Question.is_active == True)
    )

    successful_payments = await db.scalar(
        select(func.count(Payment.id))
        .where(Payment.status == "success")
    )

    failed_payments = await db.scalar(
        select(func.count(Payment.id))
        .where(Payment.status != "success")
    )

    total_revenue = await db.scalar(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.status == "success")
    )

    overall_accuracy = (
        (correct_attempts / total_attempts) * 100
        if total_attempts > 0
        else 0.0
    )

    return AdminAnalyticsResponse(
        total_attempts=total_attempts or 0,
        correct_attempts=correct_attempts or 0,
        wrong_attempts=wrong_attempts or 0,
        overall_accuracy=round(overall_accuracy, 2),
        active_users=active_users or 0,
        inactive_users=inactive_users or 0,
        total_questions=total_questions or 0,
        active_questions=active_questions or 0,
        successful_payments=successful_payments or 0,
        failed_payments=failed_payments or 0,
        total_revenue=float(total_revenue or 0),
    )