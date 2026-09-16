from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.subscription import Subscription


async def get_active_subscription(
    db: AsyncSession,
    user_id: int,
) -> Subscription | None:

    result = await db.execute(
        select(Subscription)
        .where(
            Subscription.user_id == user_id,
            Subscription.is_active == True,
            Subscription.expires_at > datetime.utcnow(),
        )
        .order_by(Subscription.expires_at.desc())
    )

    return result.scalars().first()


async def has_active_subscription(
    db: AsyncSession,
    user_id: int,
) -> bool:

    subscription = await get_active_subscription(
        db,
        user_id,
    )

    return subscription is not None