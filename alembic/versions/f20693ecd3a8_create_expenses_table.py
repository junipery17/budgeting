"""create expenses table

Revision ID: f20693ecd3a8
Revises: f3a045d3d45a
Create Date: 2026-04-07 21:57:51.859096

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f20693ecd3a8'
down_revision: Union[str, Sequence[str], None] = 'f3a045d3d45a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'expenses',
        sa.Column('expense_id', sa.Integer, primary_key=True, nullable=False, autoincrement=True),
        sa.Column('budget_id', sa.Integer, nullable=False),
        sa.Column('cost', sa.Float, nullable = False),
        sa.Column('budget_type', sa.String(50), nullable=False),
        sa.Column('description', sa.String(75)),
        sa.Column('timestamp', sa.DateTime, nullable=False, server_default=sa.func.current_date())
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('expenses')
