"""create accounts table

Revision ID: ce43dd55041e
Revises: 
Create Date: 2026-04-05 19:37:42.837859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce43dd55041e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'accounts',
        sa.Column('account_id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('budget', sa.Float)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("accounts")
