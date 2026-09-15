import redis.asyncio as redis

from app.core.config import settings


redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
)


async def store_session(
    user_id: int,
    session_token: str,
    expires_in: int,
) -> None:
    key = f"user_session:{user_id}"

    await redis_client.set(
        key,
        session_token,
        ex=expires_in,
    )


async def get_session(user_id: int) -> str | None:
    key = f"user_session:{user_id}"

    return await redis_client.get(key)


async def revoke_session(user_id: int) -> None:
    key = f"user_session:{user_id}"

    await redis_client.delete(key)