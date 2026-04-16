"""link budgets to accounts

Revision ID: 2a3d15fbb7a9
Revises: f20693ecd3a8
Create Date: 2026-04-15 22:25:59.676671

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2a3d15fbb7a9'
down_revision: Union[str, Sequence[str], None] = 'f20693ecd3a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_foreign_key(op.f("fk_budgets_accounts"), "budgets", "accounts", ["account_id"], ["account_id"])
    


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_budgets_accounts"), "accounts", type_="foreignkey")
