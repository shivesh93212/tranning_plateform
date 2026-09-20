import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings


async def add_dsa_columns():
    engine = create_async_engine(settings.DATABASE_URL)

    async with engine.begin() as conn:
        await conn.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS company_id INTEGER
                """
            )
        )

        await conn.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS problem_link VARCHAR(500)
                """
            )
        )

        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS ix_questions_company_id
                ON questions (company_id)
                """
            )
        )

        await conn.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'fk_questions_company_id'
                    ) THEN
                        ALTER TABLE questions
                        ADD CONSTRAINT fk_questions_company_id
                        FOREIGN KEY (company_id)
                        REFERENCES companies(id);
                    END IF;
                END
                $$;
                """
            )
        )

    await engine.dispose()

    print("DSA columns added successfully.")


if __name__ == "__main__":
    asyncio.run(add_dsa_columns())