import asyncio

from app.db.database import engine, Base

from app.db.models.user import User
from app.db.models.topic import Topic
from app.db.models.subtopic import Subtopic
from app.db.models.company import Company
from app.db.models.question import Question
from app.db.models.question_option import QuestionOption
from app.db.models.attempt import Attempt
from app.db.models.user_progress import UserProgress
from app.db.models.user_topic_progress import UserTopicProgress
from app.db.models.subscription import Subscription
from app.db.models.payment import Payment
from app.db.models.session import Session
from app.db.models.practice_session import PracticeSession
from app.db.models.practice_session_question import PracticeSessionQuestion


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("All database tables created successfully.")


if __name__ == "__main__":
    asyncio.run(create_tables())