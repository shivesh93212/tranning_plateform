"""make question subtopic nullable

Revision ID: 90f52cf9f0e1
Revises: a8f2dd9558e4
Create Date: 2026-09-27 00:30:58.491636
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "90f52cf9f0e1"
down_revision: Union[str, Sequence[str], None] = "a8f2dd9558e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make questions.subtopic_id nullable."""

    op.alter_column(
        "questions",
        "subtopic_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )


def downgrade() -> None:
    """Make questions.subtopic_id NOT NULL."""

    op.alter_column(
        "questions",
        "subtopic_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )