import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings


async def add_company_fields():
    engine = create_async_engine(settings.DATABASE_URL)

    async with engine.begin() as conn:

        await conn.execute(
            text(
                """
                ALTER TABLE companies
                ADD COLUMN IF NOT EXISTS year INTEGER
                """
            )
        )

        await conn.execute(
            text(
                """
                ALTER TABLE companies
                ADD COLUMN IF NOT EXISTS source_type VARCHAR(50)
                """
            )
        )

    await engine.dispose()

    print("Company fields added successfully.")


if __name__ == "__main__":
    asyncio.run(add_company_fields())