from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminUserStatusUpdate(BaseModel):
    is_active: bool