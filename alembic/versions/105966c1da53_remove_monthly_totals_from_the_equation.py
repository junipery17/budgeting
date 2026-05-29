"""remove monthly_totals from the equation

Revision ID: 105966c1da53
Revises: 2edf17481867
Create Date: 2026-05-28 18:27:04.076644

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '105966c1da53'
down_revision: Union[str, Sequence[str], None] = '2edf17481867'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("expenses", sa.Column("account_id", sa.Integer))
    op.execute("""UPDATE expenses as e1
               SET account_id = (SELECT monthly_totals.account_id FROM monthly_totals
                                    JOIN budgets ON budgets.total_id = monthly_totals.total_id
                                    JOIN expenses as e2 ON budgets.budget_id = e2.budget_id
                                    WHERE e1.expense_id = e2.expense_id);""")
    op.alter_column("expenses", "account_id", nullable=False)
    op.alter_column("expenses", "budget_id", nullable=True)
    op.create_foreign_key(op.f("fk_expenses_accounts"), "expenses", "accounts", ["account_id"], ["account_id"], ondelete="CASCADE")
    op.drop_constraint(op.f("fk_expenses_budgets"), "expenses", type_="foreignkey")
    op.create_foreign_key(op.f("fk_expenses_budgets"), "expenses", "budgets", ["budget_id"], ["budget_id"])
    
    op.drop_constraint(op.f("fk_budgets_monthly_totals"), "budgets", type_="foreignkey")
    op.drop_table("monthly_totals")
    


def downgrade() -> None:
    """Downgrade schema."""
    op.create_table(
        'monthly_totals',
        sa.Column('total_id', sa.Integer, primary_key=True, nullable=False, autoincrement=True),
        sa.Column('account_id', sa.Integer, nullable=False),
        sa.Column('month', sa.Integer, nullable=False),
        sa.Column('year', sa.Integer, nullable=False),
        sa.Column('total_expenses', sa.Float, server_default="0.0", nullable=False),
        sa.Column('monthly_budget', sa.Float, nullable=False)
    )
    op.create_foreign_key(op.f("fk_budgets_monthly_totals"), "budgets", "monthly_totals", ["total_id"], ["total_id"], ondelete="CASCADE")
    op.drop_constraint(op.f("fk_expenses_budgets"), "expenses", type_="foreignkey")
    op.create_foreign_key(op.f("fk_expenses_budgets"), "expenses", "budgets", ["budget_id"], ["budget_id"], ondelete="CASCADE")
    op.drop_constraint(op.f("fk_expenses_accounts"), "expenses", type_="foreignkey")
    op.drop_column("expenses", "account_id")
    
