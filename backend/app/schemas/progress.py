from datetime import datetime
from pydantic import BaseModel


class UserProgressResponse(BaseModel):
    questions_solved: int
    correct_answers: int
    wrong_answers: int
    accuracy: float
    streak_days: int
    last_activity_at: datetime | None

    model_config = {"from_attributes": True}


class TopicProgressResponse(BaseModel):
    topic_id: int
    topic_name: str
    questions_solved: int
    correct_answers: int
    wrong_answers: int
    accuracy: float
    last_attempted_at: datetime | None