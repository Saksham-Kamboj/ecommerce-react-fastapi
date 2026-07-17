# E-Commerce Platform — React + FastAPI

A full-stack e-commerce web application built with **React 19** (frontend) and **FastAPI** (backend), featuring authentication, product management, cart, wishlist, and user profiles.

---

## Tech Stack

### Frontend

| Technology          | Version | Purpose             |
| ------------------- | ------- | ------------------- |
| React               | 19      | UI framework        |
| TypeScript          | ~6      | Type safety         |
| Vite                | 8       | Build tool          |
| Tailwind CSS        | 4       | Styling             |
| shadcn/ui (Base UI) | —       | Component library   |
| React Router DOM    | 7       | Client-side routing |
| React Hook Form     | 7       | Form management     |
| Lucide React        | —       | Icons               |
| date-fns            | 4       | Date formatting     |

### Backend

| Technology   | Version | Purpose          |
| ------------ | ------- | ---------------- |
| FastAPI      | 0.115   | API framework    |
| SQLAlchemy   | 2.0     | ORM              |
| PostgreSQL   | —       | Database         |
| Alembic      | 1.13    | DB migrations    |
| Pydantic     | 2.9     | Data validation  |
| python-jose  | 3.3     | JWT tokens       |
| bcrypt       | 4.2     | Password hashing |
| fastapi-mail | 1.4     | Email (OTP)      |

---

## Project Structure

```
ecommerce-react-fastapi/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py       # Login, register, OTP
│   │   │       │   ├── users.py      # User CRUD + self-service
│   │   │       │   ├── products.py   # Product CRUD
│   │   │       │   ├── cart.py       # Cart operations
│   │   │       │   └── wishlist.py   # Wishlist operations
│   │   │       └── api.py
│   │   ├── core/
│   │   │   ├── config.py             # App settings
│   │   │   └── security.py           # JWT + bcrypt
│   │   ├── crud/                     # Database operations
│   │   ├── db/                       # Session + base
│   │   ├── models/                   # SQLAlchemy models
│   │   ├── schemas/                  # Pydantic schemas
│   │   └── main.py
│   ├── alembic/                      # DB migrations
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── components/
        │   ├── admin/                # Admin-specific components
        │   ├── cart/                 # CartSheet
        │   ├── user/                 # ProductCard
        │   └── wishlist/             # WishlistSheet
        ├── contexts/
        │   ├── AuthContext.tsx
        │   ├── CartContext.tsx
        │   └── WishlistContext.tsx
        ├── layouts/
        │   ├── AppLayout.tsx
        │   └── sidebar/
        ├── lib/api/                  # API client functions
        ├── pages/
        │   ├── admin/                # Dashboard, Users, Products
        │   └── user/                 # Profile, Products, Cart, Wishlist, Orders
        ├── routes/
        │   ├── AdminRoutes.tsx
        │   ├── UserRoutes.tsx
        │   └── AuthRoutes.tsx
        └── types/                    # TypeScript interfaces
```

---

## Features

### Authentication

- [x] User registration
- [x] Login with JWT tokens
- [x] OTP-based password reset via email
- [x] Role-based access control (`user` / `superadmin`)
- [x] Protected routes per role

### User Profile

- [x] View profile (name, email, phone, bio, DOB)
- [x] Edit personal information
- [x] Manage delivery address
- [x] Change password
- [x] Cart summary in profile
- [x] Wishlist summary in profile

### Products (Public)

- [x] Browse all active products
- [x] Search products
- [x] Pagination
- [x] "Showing X to Y of Z" count
- [x] Add to cart from product card
- [x] Wishlist toggle on product card

### Cart

- [x] Add / remove items
- [x] Update quantity with debouncing (no API spam)
- [x] Optimistic UI updates
- [x] Cart sheet (slide-in sidebar)
- [x] Dedicated cart page with order summary
- [x] Clear cart

### Wishlist

- [x] Add / remove products
- [x] Wishlist sheet (slide-in sidebar)
- [x] Dedicated wishlist page
- [x] Live counts in header and sidebar

### Admin Panel

- [x] User management (create, edit, delete, search, sort, paginate)
- [x] Product management (create, edit, delete, search, sort, paginate)
- [x] Role-based sidebar (admin vs user nav)

### Sidebar & Layout

- [x] Collapsible sidebar
- [x] Active route highlighting
- [x] Live badge counts (cart, wishlist) in sidebar
- [x] Dark / Light / System theme toggle
- [x] Breadcrumb navigation

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Path              | Description             |
| ------ | ----------------- | ----------------------- |
| POST   | `/login`          | Login, returns JWT      |
| POST   | `/register`       | Register new user       |
| POST   | `/send-otp`       | Send OTP to email       |
| POST   | `/reset-password` | Reset password with OTP |

### Users — `/api/v1/users`

| Method | Path                  | Auth  | Description        |
| ------ | --------------------- | ----- | ------------------ |
| GET    | `/me`                 | User  | Get current user   |
| PUT    | `/me`                 | User  | Update own profile |
| POST   | `/me/change-password` | User  | Change password    |
| GET    | `/`                   | Admin | List all users     |
| POST   | `/`                   | Admin | Create user        |
| GET    | `/{id}`               | Admin | Get user by ID     |
| PUT    | `/{id}`               | Admin | Update user        |
| DELETE | `/{id}`               | Admin | Delete user        |

### Products — `/api/v1/products`

| Method | Path    | Auth   | Description                            |
| ------ | ------- | ------ | -------------------------------------- |
| GET    | `/`     | Public | List products (search, sort, paginate) |
| GET    | `/{id}` | Public | Get product by ID                      |
| POST   | `/`     | Admin  | Create product                         |
| PATCH  | `/{id}` | Admin  | Update product                         |
| DELETE | `/{id}` | Admin  | Delete product                         |

### Cart — `/api/v1/cart`

| Method | Path          | Auth | Description             |
| ------ | ------------- | ---- | ----------------------- |
| GET    | `/`           | User | Get current user's cart |
| POST   | `/items`      | User | Add item to cart        |
| PATCH  | `/items/{id}` | User | Update item quantity    |
| DELETE | `/items/{id}` | User | Remove item             |
| DELETE | `/`           | User | Clear cart              |

### Wishlist — `/api/v1/wishlist`

| Method | Path            | Auth | Description          |
| ------ | --------------- | ---- | -------------------- |
| GET    | `/`             | User | Get wishlist         |
| POST   | `/{product_id}` | User | Add to wishlist      |
| DELETE | `/{product_id}` | User | Remove from wishlist |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ and pnpm
- PostgreSQL

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and secret key

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/api/v1/openapi.json`

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PROJECT_NAME=E-Commerce Platform
SECRET_KEY=your-strong-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=ecommerce_db

# Email (for OTP password reset)
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your@email.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=E-Commerce Platform
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
```

---

## Database Migrations

```bash
# After changing any model
alembic revision --autogenerate -m "description"
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## Default Roles

| Role         | Access                                                       |
| ------------ | ------------------------------------------------------------ |
| `user`       | Profile, Products, Cart, Wishlist, Orders                    |
| `superadmin` | All user features + Admin panel (Users, Products management) |

> The **first registered user** is automatically assigned the `superadmin` role.

---

## Roadmap

- [ ] Orders system (create, track, cancel)
- [ ] Product detail page (`/products/:id`)
- [ ] Product images (upload + storage)
- [ ] Product categories and filters
- [ ] Admin dashboard with real metrics
- [ ] Razorpay / Stripe payment integration
- [ ] Order status management (admin)
- [ ] Email notifications (order confirmation, shipping)
- [ ] Product reviews and ratings
