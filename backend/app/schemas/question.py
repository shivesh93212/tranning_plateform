from datetime import datetime

from pydantic import BaseModel, Field


class QuestionOptionCreate(BaseModel):
    option_text: str = Field(
        min_length=1,
        max_length=500,
    )

    option_label: str = Field(
        min_length=1,
        max_length=1,
    )

    is_correct: bool = False


class QuestionCreate(BaseModel):
    topic_id: int
    subtopic_id: int

    question_text: str = Field(
        min_length=5,
    )

    difficulty: int = Field(
        ge=1,
        le=5,
    )

    question_type: str = Field(
        min_length=1,
        max_length=50,
    )

    source_type: str = Field(
        min_length=1,
        max_length=50,
    )

    company_year: int | None = None

    explanation: str

    shortcut: str | None = None

    solution_steps: str | None = None

    options: list[QuestionOptionCreate] = Field(
        min_length=2,
        max_length=6,
    )


class QuestionOptionResponse(BaseModel):
    id: int
    question_id: int
    option_text: str
    option_label: str
    is_correct: bool

    model_config = {
        "from_attributes": True
    }


class QuestionResponse(BaseModel):
    id: int
    topic_id: int
    subtopic_id: int
    question_text: str
    difficulty: int
    question_type: str
    source_type: str
    company_year: int | None
    explanation: str
    shortcut: str | None
    solution_steps: str | None
    is_active: bool
    created_at: datetime

    options: list[QuestionOptionResponse]

    model_config = {
        "from_attributes": True
    }


class QuestionOptionUpdate(BaseModel):
    option_text: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )

    option_label: str | None = Field(
        default=None,
        min_length=1,
        max_length=1,
    )

    is_correct: bool | None = None


class QuestionUpdate(BaseModel):
    topic_id: int | None = None
    subtopic_id: int | None = None

    question_text: str | None = Field(
        default=None,
        min_length=5,
    )

    difficulty: int | None = Field(
        default=None,
        ge=1,
        le=5,
    )

    question_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    source_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    company_year: int | None = None

    explanation: str | None = None

    shortcut: str | None = None

    solution_steps: str | None = None

    is_active: bool | None = None

    options: list[QuestionOptionCreate] | None = Field(
        default=None,
        min_length=2,
        max_length=6,
    )