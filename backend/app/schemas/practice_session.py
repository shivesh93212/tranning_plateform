from datetime import datetime
from pydantic import BaseModel, Field


class PracticeSessionCreate(BaseModel):
    topic_id: int | None = None
    total_questions: int = Field(ge=1, le=50)


class SessionQuestionResponse(BaseModel):
    id: int
    question_id: int
    question_order: int
    selected_option_id: int | None
    is_correct: bool | None
    time_taken_seconds: int | None

    model_config = {"from_attributes": True}


class PracticeSessionResponse(BaseModel):
    id: int
    user_id: int
    topic_id: int | None
    total_questions: int
    status: str
    score: int
    started_at: datetime
    completed_at: datetime | None
    questions: list[SessionQuestionResponse]

    model_config = {"from_attributes": True}


class SessionSubmitRequest(BaseModel):
    question_id: int
    selected_option_id: int | None = None
    time_taken_seconds: int | None = Field(
        default=None,
        ge=0,
    )


class SessionSubmitResponse(BaseModel):
    question_id: int
    selected_option_id: int | None
    is_correct: bool
    score: int

class SessionResultQuestion(BaseModel):
    question_id: int
    question_order: int
    selected_option_id: int | None
    is_correct: bool | None
    time_taken_seconds: int | None


class PracticeSessionResultResponse(BaseModel):
    session_id: int
    total_questions: int
    answered_questions: int
    correct_answers: int
    wrong_answers: int
    unanswered_questions: int
    score: int
    accuracy: float
    total_time_seconds: int
    status: str
    questions: list[SessionResultQuestion]