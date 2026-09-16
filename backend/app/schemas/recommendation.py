from pydantic import BaseModel


class RecommendedQuestionResponse(BaseModel):
    id: int
    topic_id: int
    subtopic_id: int
    question_text: str
    difficulty: int
    question_type: str
    source_type: str
    company_year: int | None
    reason: str

    model_config = {"from_attributes": True}