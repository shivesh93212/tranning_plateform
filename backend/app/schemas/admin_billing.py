from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminSubscriptionResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: EmailStr
    plan: str
    amount: float
    starts_at: datetime
    expires_at: datetime
    is_active: bool
    created_at: datetime


class AdminPaymentResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: EmailStr
    subscription_id: int | None
    amount: float
    razorpay_order_id: str
    razorpay_payment_id: str | None
    status: str
    created_at: datetime