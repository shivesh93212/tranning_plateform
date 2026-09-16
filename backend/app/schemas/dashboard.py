from datetime import datetime
from pydantic import BaseModel


class DashboardTopicProgress(BaseModel):
    topic_id: int
    topic_name: str
    questions_solved: int
    correct_answers: int
    wrong_answers: int
    accuracy: float


class DashboardRecentAttempt(BaseModel):
    attempt_id: int
    question_id: int
    question_text: str
    is_correct: bool
    time_taken_seconds: int | None
    attempted_at: datetime


class DashboardResponse(BaseModel):
    user_name: str
    total_questions_solved: int
    correct_answers: int
    wrong_answers: int
    accuracy: float
    streak_days: int

    topic_progress: list[DashboardTopicProgress]
    recent_attempts: list[DashboardRecentAttempt]