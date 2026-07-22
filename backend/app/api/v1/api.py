from fastapi import APIRouter

from app.api.v1.endpoints import auth, cart, health, orders, payments, products, users, wishlist, categories, reviews, admin, notifications, websockets, addresses

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(addresses.router, prefix="/addresses", tags=["addresses"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(notifications.router, prefix="/admin/notifications", tags=["admin-notifications"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websockets"])
api_router.include_router(reviews.router, tags=["reviews"])
