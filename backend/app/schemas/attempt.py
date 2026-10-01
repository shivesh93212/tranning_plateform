from datetime import datetime

from pydantic import BaseModel, Field


class AttemptCreate(BaseModel):
    question_id: int
    selected_option_id: int | None = None
    time_taken_seconds: int | None = Field(default=None, ge=0)


class AttemptResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    selected_option_id: int | None
    is_correct: bool
    time_taken_seconds: int | None
    attempted_at: datetime

    model_config = {"from_attributes": True}

class PracticeOptionResponse(BaseModel):
    id: int
    option_text: str
    option_label: str

    model_config = {"from_attributes": True}



class PracticeQuestionResponse(BaseModel):
    id: int
    topic_id: int
    subtopic_id: int | None = None
    question_text: str
    difficulty: int
    question_type: str
    source_type: str
    company_year: int | None

    explanation: str | None = None
    shortcut: str | None = None
    solution_steps: str | None = None

    options: list[PracticeOptionResponse]

    attempted: bool = False
    attempt_order: int | None = None
    is_correct: bool | None = None

    model_config = {"from_attributes": True}


class AttemptResultResponse(BaseModel):
    attempt_id: int
    question_id: int
    selected_option_id: int | None
    correct_option_id: int
    is_correct: bool
    explanation: str
    shortcut: str | None
    solution_steps: str | None