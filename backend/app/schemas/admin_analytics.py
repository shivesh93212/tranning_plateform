from pydantic import BaseModel


class AdminAnalyticsResponse(BaseModel):
    total_attempts: int
    correct_attempts: int
    wrong_attempts: int
    overall_accuracy: float

    active_users: int
    inactive_users: int

    total_questions: int
    active_questions: int

    successful_payments: int
    failed_payments: int
    total_revenue: float