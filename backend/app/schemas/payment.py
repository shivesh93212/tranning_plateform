from pydantic import BaseModel
from datetime import datetime

class CreateOrderRequest(BaseModel):
    plan: str


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    razorpay_key_id: str
    plan: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str

class VerifyPaymentResponse(BaseModel):
    message: str
    subscription_id: int
    plan: str
    expires_at: datetime