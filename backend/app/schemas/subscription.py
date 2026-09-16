from datetime import datetime
from pydantic import BaseModel, Field


class SubscriptionCreate(BaseModel):
    plan: str = Field(min_length=2, max_length=50)
    amount: float = Field(ge=0)


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan: str
    amount: float
    starts_at: datetime
    expires_at: datetime
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class SubscriptionPlanResponse(BaseModel):
    plan: str
    amount: float
    duration_days: int
    description: str