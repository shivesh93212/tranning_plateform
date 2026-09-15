from datetime import datetime

from pydantic import BaseModel, Field


class TopicCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=50)
    description: str | None = None


class TopicUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    slug: str | None = Field(default=None, min_length=2, max_length=100)
    category: str | None = Field(default=None, min_length=2, max_length=50)
    description: str | None = None
    is_active: bool | None = None


class TopicResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    description: str | None
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }