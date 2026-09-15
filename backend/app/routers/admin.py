from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models.topic import Topic
from app.dependencies.auth import get_current_user
from app.db.models.user import User
from app.schemas.topic import (
    TopicCreate,
    TopicUpdate,
    TopicResponse,
)
from app.services.admin_service import require_admin


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

from app.db.models.subtopic import Subtopic
from app.db.models.topic import Topic

from app.schemas.subtopic import (
    SubtopicCreate,
    SubtopicUpdate,
    SubtopicResponse,
)

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

