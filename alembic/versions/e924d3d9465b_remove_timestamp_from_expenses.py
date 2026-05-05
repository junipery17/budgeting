"""remove timestamp from expenses

Revision ID: e924d3d9465b
Revises: 5696b6af9978
Create Date: 2026-04-27 18:58:21.054251

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e924d3d9465b'
down_revision: Union[str, Sequence[str], None] = '5696b6af9978'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("expenses", "timestamp")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("expenses", sa.Column("timestamp", sa.String(50)))
