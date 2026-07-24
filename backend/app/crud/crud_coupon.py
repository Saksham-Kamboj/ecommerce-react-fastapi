from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.crud.base import CRUDBase
from app.models.coupon import Coupon
from app.schemas.coupon import CouponCreate, CouponUpdate


class CRUDCoupon(CRUDBase[Coupon, CouponCreate, CouponUpdate]):
    def get_by_code(self, db: Session, code: str) -> Coupon | None:
        return db.execute(select(Coupon).where(Coupon.code == code)).scalar_one_or_none()

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100, search: str | None = None
    ) -> list[Coupon]:
        query = db.query(self.model)
        if search:
            query = query.filter(
                self.model.code.ilike(f"%{search}%")
            )
        return query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

    def count(self, db: Session, search: str | None = None) -> int:
        query = db.query(self.model)
        if search:
            query = query.filter(
                self.model.code.ilike(f"%{search}%")
            )
        return query.count()

    def get_active_coupons(self, db: Session) -> list[Coupon]:
        now = datetime.now(timezone.utc)
        stmt = select(Coupon).where(
            Coupon.is_active == True,
            (Coupon.valid_from.is_(None) | (Coupon.valid_from <= now)),
            (Coupon.valid_until.is_(None) | (Coupon.valid_until >= now)),
            (Coupon.usage_limit.is_(None) | (Coupon.usage_count < Coupon.usage_limit))
        ).order_by(Coupon.created_at.desc())
        return list(db.execute(stmt).scalars().all())


coupon = CRUDCoupon(Coupon)
