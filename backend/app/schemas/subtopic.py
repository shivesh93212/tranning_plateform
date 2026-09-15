from datetime import datetime

from pydantic import BaseModel, Field


class SubtopicCreate(BaseModel):
    topic_id: int
    name: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=2, max_length=100)
    description: str | None = None


class SubtopicUpdate(BaseModel):
    topic_id: int | None = None
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    slug: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    description: str | None = None
    is_active: bool | None = None


class SubtopicResponse(BaseModel):
    id: int
    topic_id: int
    name: str
    slug: str
    description: str | None
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }