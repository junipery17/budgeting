"""make table for category types

Revision ID: ebaf23d1ecb9
Revises: 936f7c0a436b
Create Date: 2026-05-18 20:56:33.682284

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ebaf23d1ecb9'
down_revision: Union[str, Sequence[str], None] = '936f7c0a436b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "categories",
        sa.Column("category_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("account_id", sa.Integer)
    )
    op.add_column("budgets", sa.Column("category_id", sa.Integer, nullable=False))
    op.create_foreign_key(op.f("fk_budgets_categories"), "budgets", "categories", ["category_id"], ["category_id"], ondelete="CASCADE")
    op.create_foreign_key(op.f("fk_categories_accounts"), "categories", "accounts", ["account_id"], ["account_id"])
    op.drop_column("budgets", "budget_type")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("fk_budgets_categories"), "budgets", type_="foreignkey")
    op.drop_constrain(op.f("fk_categories_accounts"), "categories", type="foreignkey")
    op.drop_column("budgets", "category_id")
    op.drop_table("categories")
    op.add_column("budgets", sa.Column('budget_type', sa.String(50), nullable=False))
    
