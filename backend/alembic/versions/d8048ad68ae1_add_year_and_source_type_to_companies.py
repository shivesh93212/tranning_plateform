"""add year and source_type to companies

Revision ID: d8048ad68ae1
Revises: 90f52cf9f0e1
Create Date: 2026-10-01 14:32:25.327053
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d8048ad68ae1"
down_revision: Union[str, Sequence[str], None] = "90f52cf9f0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass