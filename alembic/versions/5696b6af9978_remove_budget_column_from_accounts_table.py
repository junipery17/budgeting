"""remove budget column from accounts table

Revision ID: 5696b6af9978
Revises: c064812fb267
Create Date: 2026-04-20 20:36:24.476294

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5696b6af9978'
down_revision: Union[str, Sequence[str], None] = 'c064812fb267'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("accounts", "budget")


def downgrade() -> None:
    """Downgrade schema."""
    pass
