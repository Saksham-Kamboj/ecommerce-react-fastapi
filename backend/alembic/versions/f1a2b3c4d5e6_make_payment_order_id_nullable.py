"""make_payment_order_id_nullable

Revision ID: f1a2b3c4d5e6
Revises: c53b101fc089
Create Date: 2026-07-21 15:42:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'c53b101fc089'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Allow order_id to be NULL in payments table (for new payment-first flow)
    op.alter_column('payments', 'order_id',
               existing_type=sa.UUID(),
               nullable=True)


def downgrade() -> None:
    # Revert to NOT NULL (if rolling back)
    op.alter_column('payments', 'order_id',
               existing_type=sa.UUID(),
               nullable=False)
