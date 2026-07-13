from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine


def init_db(db: Session) -> None:
    """
    Create tables directly from models (useful for local/dev only).
    In production, prefer Alembic migrations instead of this.
    """
    Base.metadata.create_all(bind=engine)
