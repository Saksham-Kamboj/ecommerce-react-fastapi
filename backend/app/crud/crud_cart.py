import uuid
from sqlalchemy.orm import Session
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate
from fastapi import HTTPException

class CRUDCart:
    def get_or_create_cart(self, db: Session, user_id: uuid.UUID) -> Cart:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    def get_cart_by_user(self, db: Session, user_id: uuid.UUID) -> Cart:
        return self.get_or_create_cart(db, user_id)

    def add_item_to_cart(self, db: Session, cart_id: uuid.UUID, item_in: CartItemCreate) -> CartItem:
        # Check if product exists and has stock
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if not product.is_active:
            raise HTTPException(status_code=400, detail="Product is not active")
        
        # Check if item already exists in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == item_in.product_id
        ).first()

        new_quantity = item_in.quantity
        if existing_item:
            new_quantity += existing_item.quantity

        if product.stock_quantity < new_quantity:
            raise HTTPException(status_code=400, detail="Not enough stock for this product")

        if existing_item:
            existing_item.quantity = new_quantity
            db.commit()
            db.refresh(existing_item)
            return existing_item
        else:
            new_item = CartItem(
                cart_id=cart_id,
                product_id=item_in.product_id,
                quantity=item_in.quantity
            )
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            return new_item

    def update_item_quantity(self, db: Session, item_id: uuid.UUID, item_in: CartItemUpdate) -> CartItem:
        item = db.query(CartItem).filter(CartItem.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        # Check stock
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product.stock_quantity < item_in.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock for this product")

        if item_in.quantity <= 0:
            db.delete(item)
            db.commit()
            return None

        item.quantity = item_in.quantity
        db.commit()
        db.refresh(item)
        return item

    def remove_item(self, db: Session, item_id: uuid.UUID) -> bool:
        item = db.query(CartItem).filter(CartItem.id == item_id).first()
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    def clear_cart(self, db: Session, cart_id: uuid.UUID) -> bool:
        db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
        db.commit()
        return True

    def calculate_total_price(self, cart: Cart) -> float:
        total = 0.0
        for item in cart.items:
            total += item.product.price * item.quantity
        return round(total, 2)

cart_crud = CRUDCart()
