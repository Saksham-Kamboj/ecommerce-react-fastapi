"""Merge multiple heads

Revision ID: 62ae9aef25b9
Revises: 3fca355049cc, f1a2b3c4d5e6
Create Date: 2026-07-21 16:05:01.960694

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '62ae9aef25b9'
down_revision = ('3fca355049cc', 'f1a2b3c4d5e6')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
