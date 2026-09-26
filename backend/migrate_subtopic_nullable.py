import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings


async def migrate():
    engine = create_async_engine(settings.DATABASE_URL)

    async with engine.begin() as conn:
        await conn.execute(
            text(
                """
                ALTER TABLE questions
                ALTER COLUMN subtopic_id DROP NOT NULL;
                """
            )
        )

    await engine.dispose()

    print("✅ questions.subtopic_id is now nullable")


if __name__ == "__main__":
    asyncio.run(migrate())