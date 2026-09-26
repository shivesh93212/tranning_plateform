from datetime import datetime

from pydantic import BaseModel, Field


class QuestionOptionCreate(BaseModel):
    option_label: str = Field(
        min_length=1,
        max_length=10,
    )
    option_text: str = Field(
        min_length=1,
    )
    is_correct: bool = False


class QuestionOptionResponse(BaseModel):
    id: int
    question_id: int
    option_text: str
    option_label: str
    is_correct: bool

    model_config = {
        "from_attributes": True,
    }


class QuestionCreate(BaseModel):
    topic_id: int

    # OPTIONAL
    subtopic_id: int | None = None

    question_text: str = Field(
        min_length=5,
    )

    difficulty: int = Field(
        ge=1,
        le=3,
    )

    question_type: str = "mcq"

    source_type: str = "practice"

    # OPTIONAL
    company_year: int | None = None

    # OPTIONAL
    explanation: str | None = None

    # OPTIONAL
    shortcut: str | None = None

    # OPTIONAL
    solution_steps: str | None = None

    options: list[QuestionOptionCreate]


class QuestionUpdate(BaseModel):
    topic_id: int | None = None

    # OPTIONAL
    subtopic_id: int | None = None

    question_text: str | None = Field(
        default=None,
        min_length=5,
    )

    difficulty: int | None = Field(
        default=None,
        ge=1,
        le=3,
    )

    question_type: str | None = None

    source_type: str | None = None

    # OPTIONAL
    company_year: int | None = None

    # OPTIONAL
    explanation: str | None = None

    # OPTIONAL
    shortcut: str | None = None

    # OPTIONAL
    solution_steps: str | None = None

    options: list[QuestionOptionCreate] | None = None

    is_active: bool | None = None


class QuestionResponse(BaseModel):

    id: int
    topic_id: int
    subtopic_id: int | None = None

    question_text: str
    difficulty: int
    question_type: str
    source_type: str

    company_year: int | None = None
    explanation: str | None = None
    shortcut: str | None = None
    solution_steps: str | None = None

    is_active: bool
    created_at: datetime

    options: list[QuestionOptionResponse] = []

    model_config = {
        "from_attributes": True,
    }