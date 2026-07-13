"""editing budgets table to add month/year and remove unneeded columns

Revision ID: 41cd9398b6ea
Revises: 629432f0d94d
Create Date: 2026-06-01 15:20:29.155383

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '41cd9398b6ea'
down_revision: Union[str, Sequence[str], None] = '629432f0d94d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("budgets", "spent")
    op.drop_column("budgets", "date_time")
    op.add_column("budgets", sa.Column("month", sa.Integer))
    op.add_column("budgets", sa.Column("year", sa.Integer))
    op.add_column("budgets", sa.Column("account_id", sa.Integer))
    op.execute("""
               UPDATE budgets as b1
               SET month = 5,
                    year = 2026,
                    account_id = 1;""")
    op.alter_column("budgets", "month", nullable=False)
    op.alter_column("budgets", "year", nullable=False)
    op.alter_column("budgets", "account_id", nullable=False)
    op.alter_column("expenses", "budget_id", nullable = True)
    op.create_foreign_key(op.f("fk_budgets_accounts"), "budgets", "accounts", ["account_id"], ["account_id"], ondelete="CASCADE")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_budgets_accounts"), "budgets", type_="foreignkey")
    op.drop_column("budgets", "account_id")
    op.drop_column("budgets", "year")
    op.drop_column("budgets", "month")
    op.add_column("budgets", sa.Column("date_time", sa.Date))
    op.add_column("budgets", sa.Column("spent", sa.Float))
