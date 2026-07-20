import uuid
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import Cart
from app.schemas.order import OrderCreate


class CRUDOrder:
    def get_by_id(self, db: Session, order_id: uuid.UUID) -> Order | None:
        return (
            db.query(Order)
            .options(joinedload(Order.payments), joinedload(Order.items), joinedload(Order.user))
            .filter(Order.id == order_id)
            .first()
        )

    def get_by_user(
        self,
        db: Session,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Order]:
        return (
            db.query(Order)
            .options(joinedload(Order.payments), joinedload(Order.items))
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 10,
        status: str | None = None,
    ) -> list[Order]:
        query = db.query(Order).options(joinedload(Order.payments), joinedload(Order.items))
        if status:
            query = query.filter(Order.status == status)
        return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    def count_by_user(self, db: Session, user_id: uuid.UUID) -> int:
        return db.query(Order).filter(Order.user_id == user_id).count()

    def count_all(self, db: Session, status: str | None = None) -> int:
        query = db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        return query.count()

    def create_from_cart(
        self,
        db: Session,
        user_id: uuid.UUID,
        cart: Cart,
        order_in: OrderCreate,
    ) -> Order:
        if not cart.items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        addr = order_in.shipping_address
        total = sum(item.product.price * item.quantity for item in cart.items)

        order = Order(
            user_id=user_id,
            status=OrderStatus.pending,
            total_amount=round(total, 2),
            shipping_name=addr.name,
            shipping_phone=addr.phone,
            shipping_address_line1=addr.address_line1,
            shipping_address_line2=addr.address_line2,
            shipping_city=addr.city,
            shipping_state=addr.state,
            shipping_postal_code=addr.postal_code,
            shipping_country=addr.country,
            notes=order_in.notes,
        )
        db.add(order)
        db.flush()  # get order.id before adding items

        for cart_item in cart.items:
            product = cart_item.product
            if product.stock_quantity < cart_item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for '{product.name}'. Available: {product.stock_quantity}",
                )
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=cart_item.quantity,
                unit_price=product.price,  # price snapshot
            )
            db.add(order_item)
            product.stock_quantity -= cart_item.quantity  # decrement stock

        db.commit()
        db.refresh(order)
        return order

    def cancel_order(self, db: Session, order: Order) -> Order:
        if order.status != OrderStatus.pending:
            raise HTTPException(
                status_code=400,
                detail=f"Only pending orders can be cancelled. Current status: {order.status}",
            )
        order.status = OrderStatus.cancelled

        # Restore stock
        for item in order.items:
            item.product.stock_quantity += item.quantity

        db.commit()
        db.refresh(order)
        return order

    def update_status(self, db: Session, order: Order, new_status: OrderStatus) -> Order:
        order.status = new_status
        db.commit()
        db.refresh(order)
        return order


order_crud = CRUDOrder()
