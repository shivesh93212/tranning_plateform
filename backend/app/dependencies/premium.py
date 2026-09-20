from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.services.subscription_service import has_active_subscription


async def require_premium_user(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Admin gets full access
    if current_user.role == "admin":
        return current_user

    # Check active subscription
    has_subscription = await has_active_subscription(
        db,
        current_user.id,
    )

    if not has_subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active premium subscription required",
        )

    return current_user