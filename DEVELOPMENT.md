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

## Known Technical Decisions

| Decision                           | Reason                                     |
| ---------------------------------- | ------------------------------------------ |
| JWT stored in DB (`access_token`)  | Allows server-side token revocation        |
| Debounced cart updates (500ms)     | Prevents API spam on rapid +/- clicks      |
| Optimistic UI for cart/wishlist    | Instant feedback, rollback on error        |
| `useRef` guard for wishlist load   | Avoids `set-state-in-effect` ESLint rule   |
| `@base-ui` instead of Radix        | Shadcn v4 uses Base UI as primitive layer  |
| Cart items ordered by `created_at` | Prevents items jumping on quantity update  |
| First user = superadmin            | Simplifies initial setup                   |
| Plain `<span>` for header badges   | Badge component padding makes it too large |
| Order prices snapshotted           | Product price changes should not alter old orders |
| Shipping address snapshotted       | Orders keep delivery details as placed     |
| Product category `SET NULL`        | Deleting a category should not delete products |

---

## ESLint Rules & How We Handle Them

| Rule                                   | How Handled                                                                |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `react-hooks/set-state-in-effect`      | `useRef` guard + async callbacks, no disable comments                      |
| `react-refresh/only-export-components` | Disable comment only for shadcn-generated files (e.g., `tabsListVariants`) |
| `react-hooks/exhaustive-deps`          | All functions in `useCallback`, all values in `useMemo` deps               |
| `@typescript-eslint/no-unused-vars`    | Remove unused code, no suppression                                         |
| Nested ternaries                       | Extracted to functions (`getDefaultPath`, `getBadge`)                      |
| `Prefer String#codePointAt`            | Use `codePointAt(0) ?? 0` instead of `charCodeAt`                          |
| Readonly props                         | All component props wrapped in `Readonly<{...}>`                           |

---

## Pending Features (Prioritized)
### 🟡 Priority 1 — Admin Dashboard Metrics

**Backend needed:**

- `GET /admin/stats` — total users, total products, total orders, total revenue, recent orders

**Frontend needed:**

- Replace static cards with real numbers
- Simple charts (optional — recharts or similar)

---

### 🟢 Priority 2 — Payment Integration (Razorpay)

**Requires:** Orders system is complete

**Flow:**

1. User clicks "Proceed to Checkout"
2. Frontend calls `POST /orders` → gets `order_id`
3. Frontend calls `POST /payments/create` → gets Razorpay `order_id`
4. Razorpay checkout popup opens
5. On success, frontend calls `POST /payments/verify` with signature
6. Backend verifies signature, marks order as `confirmed`

**Backend needed:**

- `razorpay` Python package
- `POST /payments/create` — create Razorpay order
- `POST /payments/verify` — verify payment signature (HMAC-SHA256)
- `Payment` model to store transaction records

**Frontend needed:**

- Load Razorpay checkout script
- Checkout button flow
- Payment success/failure pages

---

### 🟢 Priority 3 — Logout API Endpoint

**Backend needed:**

- `POST /auth/logout` — set `user.access_token = None` in DB

**Frontend needed:**

- Call logout endpoint before clearing local token

---

### 🟢 Priority 4 — DB Constraints & Data Integrity

- Add `UniqueConstraint("user_id", "product_id")` to `wishlist_items` table
- Add migration for the constraint

---

### 🔵 Future / Nice to Have

- Product reviews and ratings (star rating per product)
- Email notifications (order confirmation, shipping update)
- Coupon / discount codes
- Address book (multiple saved addresses per user)
- Search suggestions / autocomplete
- Recently viewed products
- Related products section
- PWA support
- Admin analytics dashboard with charts

---

## Migration History

| Migration                    | Description                      |
| ---------------------------- | -------------------------------- |
| init                         | Initial tables (users, products) |
| add_product_model            | Product table                    |
| add_cart_and_cartitem_models | Cart and CartItem tables         |
| add_role_column_to_user      | role field on User               |
| move_otp_to_user_table       | OTP fields on User               |
| add_updated_at               | updated_at fields                |
| add_profile_fields_to_user   | phone, DOB, bio, address fields  |
| add_wishlist_items_table     | WishlistItem table               |
| create_orders_system         | Order and OrderItem tables       |
| add_categories_and_product_category_id | Categories table and product category FK |
| remove_category_description  | Removed unused category description field |

---

## API Response Format

All endpoints return a consistent envelope:

```json
// Standard response
{
  "success": true,
  "message": "Description of result",
  "data": { ... }
}

// Paginated response
{
  "success": true,
  "message": "Description",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}

// Error response
{
  "success": false,
  "message": "Error description"
}
```

---

## Frontend Context Architecture

```
AuthContext
  └── user, token, isAuthenticated, isLoading
  └── login(), logout(), updateUser()

CartContext
  └── cart (full CartOut with items), isLoading, isCartOpen
  └── addToCart(), updateQuantity() [debounced], removeFromCart(), clearCart()
  └── Optimistic: immediate UI update, API fires 500ms after last action

WishlistContext
  └── items (WishlistItemOut[]), isLoading, isWishlistOpen
  └── toggle() [optimistic], refresh()
  └── isWishlisted(productId) → boolean
```

---

## Component Reuse Pattern

`ProductCard` is reused across:

- `/products` page grid
- `/wishlist` page grid (same component, wishlist state auto-reflects)

This means any change to ProductCard appearance or behavior applies everywhere automatically.

---

## Running Linting & Build

```bash
# Frontend
cd frontend
pnpm lint        # ESLint check
pnpm typecheck   # TypeScript check
pnpm build       # Full production build (tsc + vite)
pnpm format      # Prettier format

# Backend
cd backend
# No linter configured yet — can add ruff or flake8
```

---

## Code Quality Standard — SonarQube / SonarLint

SonarLint is active in the IDE. All code written must be **Sonar-friendly** — zero warnings, zero code smells. SonarLint flags issues in real-time; unresolved smells add technical debt and make the codebase harder to maintain.

---

### Python (Backend) — Sonar Rules to Follow

| Rule                    | Bad ❌                   | Good ✅                           |
| ----------------------- | ------------------------ | --------------------------------- |
| Cognitive complexity    | Deep nested if/for/try   | Extract to small functions        |
| Magic numbers           | `if limit > 10:`         | `MAX_LIMIT = 10`                  |
| Unused imports          | `import os` (never used) | Remove it                         |
| Bare except             | `except:`                | `except ValueError:`              |
| Mutable default args    | `def fn(items=[])`       | `def fn(items=None)`              |
| Too many parameters     | `def fn(a,b,c,d,e,f,g)`  | Group into dataclass/schema       |
| Hardcoded credentials   | `password = "abc123"`    | Use env vars                      |
| Missing type hints      | `def get_user(id):`      | `def get_user(id: UUID) -> User:` |
| `print()` in production | `print("debug")`         | Use `logging` module              |

```python
# ❌ Sonar will flag this
def process(a, b, c, d, e, f):
    try:
        if a > 0:
            if b > 0:
                if c > 0:
                    return a + b + c
    except:
        pass

# ✅ Sonar-friendly
MAX_ITEMS = 100

def _all_positive(*values: int) -> bool:
    return all(v > 0 for v in values)

def process(a: int, b: int, c: int) -> int | None:
    try:
        if _all_positive(a, b, c):
            return a + b + c
        return None
    except ValueError as e:
        logger.error("Invalid input: %s", e)
        return None
```

---

### TypeScript / React (Frontend) — Sonar Rules to Follow

| Rule                       | Bad ❌                     | Good ✅                              |
| -------------------------- | -------------------------- | ------------------------------------ |
| Cognitive complexity       | Deeply nested ternaries    | Extract to functions or maps         |
| `any` type                 | `const data: any`          | Proper type or `unknown`             |
| Empty catch block          | `catch {}`                 | `catch (err) { console.error(err) }` |
| Dead code                  | Unreachable after `return` | Remove it                            |
| Duplicate string literals  | Same string 3+ times       | Extract to constant                  |
| Non-null assertion overuse | `user!.email` everywhere   | Proper null checks with `??`         |
| Console statements         | `console.log("debug")`     | Remove before commit                 |
| Unused variables           | `const x = 5` (never used) | Remove                               |
| Functions too long         | 100+ line function         | Break into smaller functions         |

```tsx
// ❌ Sonar will flag this — nested ternary
const getLabel = (type: string) =>
  type === "admin" ? "Administrator" : type === "user" ? "Customer" : "Unknown";

// ✅ Sonar-friendly — use a map
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  user: "Customer",
};
function getRoleLabel(type: string): string {
  return ROLE_LABELS[type] ?? "Unknown";
}
```

```tsx
// ❌ Sonar will flag this
function UserCard({ user }: { user: any }) {
  try {
    return <div>{user!.name}</div>;
  } catch {}
}

// ✅ Sonar-friendly
interface UserCardProps {
  user: { name: string | null; email: string };
}
function UserCard({ user }: Readonly<UserCardProps>) {
  return <div>{user.name ?? user.email}</div>;
}
```

---

### Early Return Pattern (Reduces Nesting & Cognitive Complexity)

```python
# ❌ Arrow anti-pattern — Sonar flags high complexity
def update_user(user_id, data):
    if user_id:
        user = db.get(user_id)
        if user:
            if user.is_active:
                user.name = data.name
                return user

# ✅ Early return — flat, readable, Sonar-clean
def update_user(user_id: UUID, data: UserUpdate) -> User:
    if not user_id:
        raise ValueError("user_id required")
    user = db.get(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if not user.is_active:
        raise HTTPException(400, "User is inactive")
    user.name = data.name
    return user
```

```tsx
// ❌ Nested — Sonar flags
function ProfilePage() {
  if (isLoading) {
    return <Spinner />;
  } else {
    if (user) {
      if (user.is_active) {
        return <Profile user={user} />;
      } else {
        return <InactiveMessage />;
      }
    }
  }
}

// ✅ Early returns — Sonar-clean
function ProfilePage() {
  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;
  if (!user.is_active) return <InactiveMessage />;
  return <Profile user={user} />;
}
```

---

### General Rules (Both Languages)

```
✅ One responsibility per function — does one thing
✅ Function length ≤ 30 lines ideally, hard max ~50
✅ File length — split files >300 lines into modules
✅ No hardcoded strings repeated 3+ times — extract to constants
✅ No commented-out code in commits
✅ Descriptive variable names — no single letters except loop counters (i, j)
✅ All TODO comments must have context or a resolution plan
✅ Avoid deep nesting (max 3 levels) — use early returns
✅ Exported functions/classes should be self-explanatory by name
```

---

### Checklist Before Every Commit

```
[ ] pnpm lint passes with zero errors (frontend)
[ ] pnpm build passes (frontend)
[ ] No console.log / print() left in code
[ ] No unused imports or variables
[ ] No nested ternaries — use functions or maps
[ ] No `any` types in TypeScript
[ ] No bare except in Python
[ ] All new functions have type hints (Python) / TypeScript types (TS)
[ ] SonarLint shows zero NEW issues in changed files
[ ] Early returns used instead of deep nesting
```
