from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.response import ApiResponse

from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    swagger_ui_parameters={"persistAuthorization": True},
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # \033[91m is the ANSI escape code for red text, \033[0m resets it
    print(f"\n\033[91m==================== APPLICATION ERROR ====================\033[0m")
    print(f"\033[91m{exc.__class__.__name__}: {str(exc)}\033[0m")
    print(f"\033[91m===========================================================\033[0m\n")
    
    import re
    # Some database libraries use literal '\n' characters instead of real newlines in their error strings
    short_error = re.split(r'\\n|\n|\r', str(exc))[0]
    
    if len(short_error) > 200:
        short_error = short_error[:197] + "..."
    
    return JSONResponse(
        status_code=500,
        content=ApiResponse(success=False, message=short_error).model_dump()
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ApiResponse(success=False, message=str(exc.detail)).model_dump()
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ApiResponse(success=False, message="Validation error", data=exc.errors()).model_dump()
    )

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} is running"}
