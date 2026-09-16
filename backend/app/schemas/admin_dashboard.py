from pydantic import BaseModel


class AdminDashboardResponse(BaseModel):
    total_users: int
    active_users: int
    total_topics: int
    total_subtopics: int
    total_questions: int
    active_questions: int
    total_attempts: int
    total_subscriptions: int
    successful_payments: int
    total_revenue: float