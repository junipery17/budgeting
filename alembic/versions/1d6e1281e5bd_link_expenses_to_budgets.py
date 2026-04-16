"""link expenses to budgets

Revision ID: 1d6e1281e5bd
Revises: 2a3d15fbb7a9
Create Date: 2026-04-15 22:50:08.845191

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d6e1281e5bd'
down_revision: Union[str, Sequence[str], None] = '2a3d15fbb7a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("expenses", "account_id")
    op.add_column("expenses", sa.Column("budget_id", sa.Integer, nullable=False) )
    op.create_foreign_key(op.f("fk_expenses_budgets"), "expenses", "budgets", ["budget_id"], ["budget_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_expenses_budgets"), "budgets", type_="foreignkey")
