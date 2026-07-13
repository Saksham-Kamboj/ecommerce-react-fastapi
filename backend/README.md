# FastAPI + PostgreSQL Boilerplate

Production-style folder structure for a FastAPI backend with PostgreSQL, SQLAlchemy 2.0, and Alembic migrations.

## Folder Structure

```
app/
├── main.py                 # FastAPI app entrypoint
├── core/
│   ├── config.py           # Settings (env vars) via pydantic-settings
│   └── security.py         # Password hashing + JWT helpers
├── db/
│   ├── base.py              # Declarative Base + model imports (for Alembic)
│   ├── session.py           # SQLAlchemy engine + SessionLocal
│   └── init_db.py           # Optional: create tables directly (dev only)
├── models/
│   └── user.py               # Example SQLAlchemy model
├── schemas/
│   └── user.py               # Pydantic request/response schemas
├── crud/
│   ├── base.py               # Generic CRUD class
│   └── crud_user.py          # User-specific CRUD
├── api/
│   ├── deps.py                # Shared dependencies (get_db, etc.)
│   └── v1/
│       ├── api.py             # Aggregates all v1 routers
│       └── endpoints/
│           ├── health.py      # GET /health
│           └── users.py       # User CRUD endpoints
tests/                         # Pytest test cases
├── utils/                     # Reusable utility functions and helper modules
alembic/                       # Database migration configurations and scripts
```

## Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate      # Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy env file and update values:
   ```bash
   cp .env.example .env
   ```
   Set `POSTGRES_SERVER=localhost` in your .env file.

4. Run Postgres locally.

5. Run first migration:
   ```bash
   alembic revision --autogenerate -m "init"
   alembic upgrade head
   ```

6. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

7. Open docs: http://localhost:8000/docs



## Running Tests

```bash
pytest
```

## Notes

- This is an empty/skeleton structure — only one example model (`User`) and its CRUD + endpoints are included to demonstrate the pattern. Add your own models under `app/models/`, schemas under `app/schemas/`, CRUD under `app/crud/`, and endpoints under `app/api/v1/endpoints/`, then register the new router in `app/api/v1/api.py`.
- Change `SECRET_KEY` before deploying anywhere real.
