"""add user and password

Revision ID: ff663cd7bb27
Revises: 41cd9398b6ea
Create Date: 2026-06-08 20:21:19.875744

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ff663cd7bb27'
down_revision: Union[str, Sequence[str], None] = '41cd9398b6ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("accounts", sa.Column("username", sa.String(50)))
    op.add_column("accounts", sa.Column("password", sa.String(75)))
    op.create_foreign_key(op.f("fk_categories_accounts"), "categories", "accounts", ["account_id"], ["account_id"], ondelete="CASCADE")
    


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_categories_accounts"), "categories", type_="foreignkey")
    op.drop_column("accounts", "username")
    op.drop_column("accounts", "password")
