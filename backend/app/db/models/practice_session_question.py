from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class PracticeSessionQuestion(Base):
    __tablename__ = "practice_session_questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    session_id: Mapped[int] = mapped_column(
        ForeignKey(
            "practice_sessions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey(
            "questions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    question_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    selected_option_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "question_options.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    is_correct: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )

    time_taken_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    answered_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    session: Mapped["PracticeSession"] = relationship(
        "PracticeSession",
        back_populates="questions",
    )

    question: Mapped["Question"] = relationship(
        "Question",
    )

    selected_option: Mapped["QuestionOption | None"] = relationship(
        "QuestionOption",
    )