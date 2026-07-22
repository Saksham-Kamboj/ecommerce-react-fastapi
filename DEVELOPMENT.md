# Development Context & Progress

This document tracks everything built so far, all decisions made, known issues fixed, and what remains to be implemented.

---

## What Was Built — Session Log

### Phase 1 — Backend Foundation

#### Database Models

- `User` — id (UUID), email, full_name, hashed_password, is_active, role, access_token, otp fields, phone, date_of_birth, bio, address fields (line1, line2, city, state, postal_code, country), created_at, updated_at
- `Product` — id (UUID), name, description, price, stock_quantity, image_url, category_id, is_active, created_at, updated_at
- `Category` — id (UUID), name, slug, created_at, updated_at
- `Cart` — id, user_id (FK), created_at, updated_at
- `CartItem` — id, cart_id (FK), product_id (FK), quantity, created_at, updated_at
- `WishlistItem` — id, user_id (FK), product_id (FK), created_at

#### Auth System

- JWT-based authentication with token stored in DB (`access_token` column)
- Token validation: checks signature + DB match (prevents reuse after logout)
- First registered user → auto-assigned `superadmin` role
- OTP password reset via email (fastapi-mail, 10-minute expiry)
- bcrypt password hashing

#### API Endpoints Built

- `POST /auth/login` — returns JWT
- `POST /auth/register` — creates user
- `POST /auth/send-otp` — sends OTP email
- `POST /auth/reset-password` — verifies OTP, updates password
- `GET /users/me` — current user
- `PUT /users/me` — self-service profile update (name, phone, bio, DOB, address)
- `POST /users/me/change-password` — verify current password, set new
- Full admin CRUD for users with pagination, search, sort
- Full admin CRUD for products with pagination, search, sort, category assignment
- Full admin CRUD for categories with pagination and search
- Cart: get, add item, update quantity (with stock check), remove item, clear
- Wishlist: get all, add (idempotent), remove
- Orders: create from cart, list user's orders, order detail, cancel pending order, admin list all, admin update status

#### CRUD Fixes

- `CRUDUser.update()` — overrode base to hash password when updating
- `CRUDCart` — `get_cart_by_user` returns items sorted by `created_at` asc (fixes item jumping to bottom on update)
- `CRUDWishlist` — idempotent add (returns existing if already wishlisted)

---

### Phase 2 — Frontend Foundation

#### Architecture

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 + shadcn/ui (Base UI components, not Radix)
- React Router DOM v7
- React Hook Form v7
- Global contexts: `AuthContext`, `CartContext`, `WishlistContext`

#### Routing

```
/ → redirects to /profile (user) or /dashboard (admin)

User routes:
  /profile    → UserProfile
  /products   → UserProducts
  /products/:id → ProductDetailPage
  /wishlist   → UserWishlist
  /cart       → UserCart
  /checkout   → CheckoutPage
  /orders     → UserOrders
  /orders/:id → OrderDetailPage

Admin routes:
  /dashboard  → AdminDashboard
  /users      → UsersPage
  /products   → ProductsPage
  /categories → CategoriesPage
```

#### Layouts & Navigation

- `AppLayout` — header with wishlist + cart icons (with live badge counts), theme toggle, `ScrollArea` for page content
- `AppSidebar` — role-based nav (user sees Profile/Products/Wishlist/Cart/Orders, admin sees Dashboard/Users/Products)
- Live badge counts on Wishlist and Cart sidebar items (from context)
- `NavMain` — supports optional `badge` prop per item
- `DynamicBreadcrumb` — auto-generates from current route
- Theme toggle — light / dark / system

---

### Phase 3 — Core Features

#### Cart System

**Backend fixes:**

- `CartItem` model: `order_by="CartItem.created_at"` on relationship to prevent item reordering
- `get_cart_by_user`: explicit `.sort(key=lambda item: item.created_at)` as safety net

**Frontend:**

- `CartContext` — optimistic updates + debounced API calls (500ms delay)
  - `updateQuantity` is synchronous (UI instant), API fires after last click
  - Cancels pending timers on `removeFromCart` and `clearCart`
  - All functions wrapped in `useCallback`, value in `useMemo`
- `CartSheet` — slide-in sheet with qty controls, remove, clear, subtotal
- `UserCart` page — full cart with order summary sidebar, sticky on desktop

#### Wishlist System

**Backend:**

- `WishlistItem` model with `user_id` + `product_id` FKs
- `User.wishlist_items` relationship with `order_by="WishlistItem.created_at"`
- Idempotent add endpoint

**Frontend:**

- `WishlistContext` — optimistic toggle, `useRef` guard pattern for initial load (avoids `set-state-in-effect` ESLint error)
- `WishlistSheet` — slide-in sheet with add-to-cart button per item
- `UserWishlist` page — reuses `ProductCard` component (same design as Products page)
- Heart icon on `ProductCard` — fills red when wishlisted, optimistic toggle

#### User Profile

- Tabs: Account | Address | Wishlist | Cart | Security | Payment
- Account tab: view + edit (name, phone, DOB, bio)
- Address tab: view + edit (full address fields)
- Wishlist tab: live items with remove button
- Cart tab: all items with delete button (no truncation)
- Security tab: change password form + 2FA coming soon card
- Payment tab: coming soon card
- After save: `updateUser(res.data)` updates AuthContext in-memory state

#### Products Page (User)

- Paginated grid with search (debounced 500ms)
- "Showing X to Y of Z products" count
- `ProductCard` — product image when available, gradient fallback, mock ratings, stock display, add to cart, wishlist toggle

---

### Phase 4 — Bug Fixes & Polish

#### Scrolling Fix (DataTable + AppLayout)

- **Problem:** `DataTable` had `max-h-[calc(100vh-250px)]` on inner `ScrollArea` — pagination was hidden behind it
- **Fix:** Removed `max-h` from `DataTable`'s `ScrollArea` (now only horizontal scroll). Replaced `ScrollArea` in `AppLayout` with pattern: `<div className="min-h-0 flex-1 overflow-hidden"><ScrollArea className="h-full">` — gives ScrollArea explicit bounded height

#### Tabs Visibility (Light Mode)

- **Problem:** Active tab same white as background — invisible in light mode
- **Fix:** Rewrote `TabsTrigger` styling: inactive = `text-muted-foreground`, active = `data-active:bg-background data-active:text-primary data-active:shadow-sm data-active:border-border`
- `TabsList` made full-width with `justify-start`

#### Header Icon Sizing

- **Problem:** Badge was larger than icon (Badge component has internal padding)
- **Fix:** Replaced `<Badge>` with plain `<span>` with precise sizing (`h-4 min-w-4 text-[10px]`). Added `overflow-visible` to button to prevent badge clipping

#### WishlistContext ESLint Fix

- **Problem:** `react-hooks/set-state-in-effect` error — can't call setState synchronously in useEffect body
- **Fix:** `useRef` guard pattern:
  ```tsx
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    void refresh(); // async, setState happens in Promise callback
  }, [refresh]);
  ```

#### nav-user.tsx Build Error

- **Problem:** `asChild` prop doesn't exist on `@base-ui` `DropdownMenuItem` (it's a Radix pattern)
- **Fix:** Replaced `<Link>` with `onClick={() => navigate("/profile")}`

#### `navUser` Naming Conflict

- **Problem:** Module-level `const navUser = [...]` array and function-level `const navUser = {...}` object — TDZ ReferenceError
- **Fix:** Renamed module-level array to `userNavItems`

#### scroll-area.tsx Build Error

- **Problem:** `import * as React from "react"` was unused (Base UI doesn't need it)
- **Fix:** Removed the import

---

### Phase 5 — Admin Panel

#### Users Page

- DataTable with avatar (dicebear API), role badge, status badge, joined/updated dates
- Sort by joined/updated columns
- Search with 500ms debounce
- Create / Edit user dialog
- Delete confirmation dialog
- Pagination with ellipsis

#### Products Page

- DataTable with product image (uploaded image or dicebear initials), name, description, price, stock, category, status
- Sort by created/updated
- Full CRUD dialogs
- "Showing X entries" in pagination

#### Categories Page

- DataTable with category name, slug, and created/updated dates
- Search with 500ms debounce
- Create / Edit category dialog
- Delete confirmation dialog
- Sidebar route added for admin category management

---

### Phase 6 — Orders & Product Detail

#### Orders System

**Backend:**

- `Order` and `OrderItem` models added with status, total amount, shipping address snapshot, order notes, price snapshot, and timestamps
- Alembic migration added: `create_orders_system`
- `POST /orders/` creates an order from the current cart, validates stock, snapshots prices/address, decrements stock, and clears cart
- `GET /orders/` returns paginated current-user order history
- `GET /orders/{order_id}` returns order detail with ownership/admin access checks
- `POST /orders/{order_id}/cancel` cancels pending orders and restores stock
- Admin endpoints added for listing all orders and updating order status

**Frontend:**

- `CheckoutPage` added with shipping address snapshot, notes, order summary, and place-order flow
- `UserOrders` page now loads real paginated order data
- `OrderDetailPage` added with status badge, progress, order items, shipping address, notes, and cancel action
- `ordersApi` client and `Order` TypeScript types added
- User routes added for `/checkout`, `/orders`, and `/orders/:orderId`

#### Product Detail Page

- Route `/products/:productId` added
- `ProductDetailPage` loads `GET /products/{id}` data
- Product detail page includes large visual area, product name, mock rating, description, price, stock badge, wishlist toggle, and cart controls
- Quantity `+ / -` controls update existing cart items directly through debounced cart context updates
- "Update Cart" button removed; existing cart quantity updates happen from the quantity controls

---

### Phase 7 — Product Images

**Backend:**

- Added nullable `image_url` field to `Product`
- Added Alembic migration: `add_product_image_url`
- Mounted `/uploads` as a static file directory
- Added `POST /products/{product_id}/upload-image` endpoint restricted to `superadmin`
- Upload validation allows JPG, PNG, and WebP images up to 2MB

**Frontend:**

- Added image upload field with preview in admin product form
- Create/edit product flow uploads the selected image after product save
- Admin product table shows uploaded product image, with initials fallback
- `ProductCard` and `ProductDetailPage` show uploaded product image, with gradient fallback
- Vite dev proxy forwards `/uploads` to the backend

---

### Phase 8 — Product Categories & Filters

**Backend:**

- Added `Category` model with unique `name` and `slug`
- Added nullable `category_id` FK on `Product` with `ON DELETE SET NULL`
- Added product-category relationship in SQLAlchemy models
- Added Alembic migrations for categories and category cleanup
- Added `/categories` CRUD endpoints with admin-only create/update/delete
- `GET /products` supports `category_id` filtering
- Product responses include `category_id` and nested `category`

**Frontend:**

- Added `categoriesApi` client and category TypeScript types
- Added admin `/categories` management page
- Added category field in admin product form
- Admin Products page supports category filtering via dropdown
- User Products page supports category filtering via dropdown
- Product cards and detail pages show category information when available

---

### Phase 9 — Payment Integration (Razorpay)

**Backend:**

- Added `razorpay` Python package
- Added `POST /payments/create` to create Razorpay orders
- Added `POST /payments/verify` to verify payment signatures (HMAC-SHA256)
- Added `Payment` model to store transaction records

**Frontend:**

- Integrated Razorpay checkout script
- Implemented checkout button flow to trigger Razorpay popup
- Added payment success/failure handling

---

### Phase 10 — Logout API Endpoint

**Backend:**

- Added `POST /auth/logout` endpoint to clear `access_token` in DB

**Frontend:**

- Update `authApi` to call the logout endpoint
- Update `AuthContext` to await API call before clearing local state

---

### Phase 11 — Admin Dashboard Metrics

**Backend:**

- Added `GET /admin/stats` endpoint aggregating total users, products, orders, revenue, and recent orders

**Frontend:**

- Replaced static HTML dashboard with Shadcn UI Cards, Table, and Badges
- Integrated Recharts (via Shadcn UI) for 30-day revenue charting
- Connected frontend Dashboard page to real API data

---

### Phase 12 — Admin Real-Time Notifications

**Backend:**

- Added `Notification` model — id (UUID), user_id (FK), type, title, message, is_read, created_at
- Added Alembic migration: `add_notifications_table`
- Added `NotificationService` — creates notifications for key events:
  - User registered
  - User deleted
  - Order placed (by any user)
  - Order payment completed
  - Order cancelled
- Notifications are created for all users with `superadmin` role on each event
- Added `GET /notifications/` — paginated list of current admin's notifications (unread first, then by date)
- Added `POST /notifications/{id}/read` — mark a single notification as read
- Added `POST /notifications/read-all` — mark all notifications as read
- Added `GET /notifications/unread-count` — returns unread count for badge

**Frontend:**

- Added `notificationsApi` client and `Notification` TypeScript types
- Added `NotificationContext` — fetches unread count on mount, polls every 30s, exposes `unreadCount`, `notifications`, `markRead()`, `markAllRead()`, `refresh()`
- Added `NotificationDropdown` in admin header — bell icon with live unread badge, dropdown list of recent notifications, "Mark all as read" action, link to full notifications page
- Added `/admin/notifications` page — full paginated notification history with read/unread state, timestamps, and mark-read actions
- Sidebar route added for admin notification management
- Unread badge on bell icon uses same `<span>` pattern as cart/wishlist badges

---

### 🔵 Future / Nice to Have

- Coupon / discount codes
- Address book (multiple saved addresses per user)
- Search suggestions / autocomplete
- Recently viewed products