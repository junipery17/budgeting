"""add date to expenses

Revision ID: 2edf17481867
Revises: ebaf23d1ecb9
Create Date: 2026-05-21 15:57:50.161440

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision: str = '2edf17481867'
down_revision: Union[str, Sequence[str], None] = 'ebaf23d1ecb9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("expenses", sa.Column("date", sa.Date))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("expenses", "date")
