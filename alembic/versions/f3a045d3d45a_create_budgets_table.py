"""create budgets table

Revision ID: f3a045d3d45a
Revises: ce43dd55041e
Create Date: 2026-04-07 21:47:57.978729

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a045d3d45a'
down_revision: Union[str, Sequence[str], None] = 'ce43dd55041e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'budgets',
        sa.Column('budget_id', sa.Integer, primary_key=True, nullable=False, autoincrement=True),
        sa.Column('account_id', sa.Integer, nullable=False),
        sa.Column('budget_type', sa.String(50), nullable=False),
        sa.Column('monthly', sa.Boolean, default=True),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('time_period', sa.DateTime, nullable=False, server_default=sa.func.now())
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('budgets')
