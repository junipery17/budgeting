"""create monthly totals table

Revision ID: b9feb49a0588
Revises: 1d6e1281e5bd
Create Date: 2026-04-16 20:41:37.585268

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9feb49a0588'
down_revision: Union[str, Sequence[str], None] = '1d6e1281e5bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'monthly_totals',
        sa.Column('total_id', sa.Integer, primary_key=True, nullable=False, autoincrement=True),
        sa.Column('account_id', sa.Integer, nullable=False),
        sa.Column('month', sa.Integer, nullable=False),
        sa.Column('year', sa.Integer, nullable=False),
        sa.Column('total_expenses', sa.Float, server_default="0.0", nullable=False),
        sa.Column('monthly_budget', sa.Float, nullable=False)
    )
    op.create_foreign_key(op.f("fk_monthly_totals_accounts"), "monthly_totals", "accounts", ["account_id"], ["account_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_monthly_totals_accounts"), "monthly_totals", type_="foreignkey")
    op.drop_table("monthly_totals")
