"""add email to accounts

Revision ID: 810366d90bc1
Revises: ff663cd7bb27
Create Date: 2026-06-10 20:14:35.991376

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '810366d90bc1'
down_revision: Union[str, Sequence[str], None] = 'ff663cd7bb27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("accounts", sa.Column("email", sa.String(50), nullable=False))
    op.alter_column("accounts", "username", nullable=False)
    op.alter_column("accounts", "password", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("accounts", "email")
