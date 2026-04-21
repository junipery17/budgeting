"""remove budget_type column in expenses

Revision ID: e0f8f779ce83
Revises: b9feb49a0588
Create Date: 2026-04-16 21:02:44.805965

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0f8f779ce83'
down_revision: Union[str, Sequence[str], None] = 'b9feb49a0588'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("expenses", "budget_type")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("expenses", sa.Column("budget_type", sa.String(50), nullable=False))
