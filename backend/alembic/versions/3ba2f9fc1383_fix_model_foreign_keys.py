"""fix model foreign keys

Revision ID: 3ba2f9fc1383
Revises: 583186cd1e7c
Create Date: 2026-09-15 13:13:36.137744

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "3ba2f9fc1383"
down_revision: Union[str, Sequence[str], None] = "583186cd1e7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_foreign_key(
        "fk_payments_subscription_id",
        "payments",
        "subscriptions",
        ["subscription_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_foreign_key(
        "fk_payments_user_id",
        "payments",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_foreign_key(
        "fk_sessions_user_id",
        "sessions",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_foreign_key(
        "fk_subscriptions_user_id",
        "subscriptions",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_payments_subscription_id",
        "payments",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_payments_user_id",
        "payments",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_sessions_user_id",
        "sessions",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_subscriptions_user_id",
        "subscriptions",
        type_="foreignkey",
    )