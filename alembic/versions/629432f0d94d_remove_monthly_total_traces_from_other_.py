"""remove monthly_total traces from other tables

Revision ID: 629432f0d94d
Revises: 105966c1da53
Create Date: 2026-05-29 16:58:17.395986

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '629432f0d94d'
down_revision: Union[str, Sequence[str], None] = '105966c1da53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("budgets", "total_id")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("budgets", sa.Column("total_id", sa.Integer))
