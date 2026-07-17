"""add product image url

Revision ID: 12f6c9a2b8d4
Revises: 6d82bed4d521
Create Date: 2026-07-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "12f6c9a2b8d4"
down_revision = "6d82bed4d521"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("image_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("products", "image_url")
