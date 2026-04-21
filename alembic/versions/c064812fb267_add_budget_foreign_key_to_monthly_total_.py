"""add budget foreign key to monthly total key

Revision ID: c064812fb267
Revises: e0f8f779ce83
Create Date: 2026-04-16 22:19:46.669162

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c064812fb267'
down_revision: Union[str, Sequence[str], None] = 'e0f8f779ce83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_foreign_key(op.f("fk_budgets_monthly_totals"), "budgets", "monthly_totals", ["total_id"], ["total_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_budgets_monthly_totals"), "budgets", type_="foreignkey")
