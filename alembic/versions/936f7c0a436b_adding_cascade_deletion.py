"""adding cascade deletion

Revision ID: 936f7c0a436b
Revises: e924d3d9465b
Create Date: 2026-05-04 21:55:02.279719

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '936f7c0a436b'
down_revision: Union[str, Sequence[str], None] = 'e924d3d9465b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(op.f("fk_monthly_totals_accounts"), "monthly_totals", type_="foreignkey")
    op.drop_constraint(op.f("fk_budgets_monthly_totals"), "budgets", type_="foreignkey")
    op.drop_constraint(op.f("fk_expenses_budgets"), "expenses", type_="foreignkey")
    op.create_foreign_key(op.f("fk_monthly_totals_accounts"), "monthly_totals", "accounts", ["account_id"], ["account_id"], ondelete="CASCADE")
    op.create_foreign_key(op.f("fk_budgets_monthly_totals"), "budgets", "monthly_totals", ["total_id"], ["total_id"], ondelete="CASCADE")
    op.create_foreign_key(op.f("fk_expenses_budgets"), "expenses", "budgets", ["budget_id"], ["budget_id"], ondelete="CASCADE")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_monthly_totals_accounts"), "monthly_totals", type_="foreignkey")
    op.drop_constraint(op.f("fk_budgets_monthly_totals"), "budgets", type_="foreignkey")
    op.drop_constraint(op.f("fk_expenses_budgets"), "expenses", type_="foreignkey")
