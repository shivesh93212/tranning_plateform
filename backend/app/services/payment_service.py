import razorpay

from app.core.config import settings


client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET,
    )
)


PLANS = {
    "1_month": {
        "amount": 149,
        "duration_days": 30,
    },
    "2_months": {
        "amount": 249,
        "duration_days": 60,
    },
    "3_months": {
        "amount": 349,
        "duration_days": 90,
    },
}


def create_razorpay_order(plan: str):
    if plan not in PLANS:
        raise ValueError("Invalid subscription plan")

    plan_data = PLANS[plan]

    amount_in_paise = int(plan_data["amount"] * 100)

    order_data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": f"subscription_{plan}",
    }

    order = client.order.create(data=order_data)

    return order

def verify_razorpay_payment(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
):
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )

        return True

    except razorpay.errors.SignatureVerificationError:
        return False