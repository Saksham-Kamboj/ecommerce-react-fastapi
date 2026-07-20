from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import create_access_token, get_password_hash
from app.crud.crud_user import user as user_crud
from app.schemas.token import Token, LoginRequest
from app.schemas.response import ApiResponse

from app.schemas.user import UserCreate, UserOut, UserRole, UserRegister
from app.schemas.auth import SendOTPRequest, ResetPasswordRequest
from app.utils.email import send_otp_email
import random
import string
from datetime import datetime, timezone, timedelta

router = APIRouter()

@router.post("/login", response_model=ApiResponse[Token])
def login_access_token(
    login_data: LoginRequest, db: Session = Depends(get_db)
) -> Any:
    """
    Login endpoint. Requires a JSON body with 'email' and 'password'.
    """
    user = user_crud.authenticate(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    raw_token = create_access_token(user.id)
    
    # Store token in database
    user.access_token = raw_token
    db.commit()
    
    token = Token(
        access_token=raw_token,
        token_type="bearer",
    )
    return ApiResponse(message="Login successful", data=token)


@router.post("/logout", response_model=ApiResponse[None])
def logout(db: Session = Depends(get_db), current_user = Depends(get_current_user)) -> Any:
    """
    Logout endpoint. Clears the user's access token in the database.
    """
    current_user.access_token = None
    db.commit()
    return ApiResponse(message="Logged out successfully", data=None)


from fastapi.security import OAuth2PasswordRequestForm

@router.post("/swagger-login", response_model=Token, include_in_schema=False)
def swagger_login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Dedicated login for Swagger UI Authorize button (which requires Form Data).
    """
    user = user_crud.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    raw_token = create_access_token(user.id)
    user.access_token = raw_token
    db.commit()
    
    return {
        "access_token": raw_token,
        "token_type": "bearer",
    }

@router.post("/register", response_model=ApiResponse[UserOut])
def register_user(user_in: UserRegister, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user.
    """
    existing = user_crud.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    create_data = UserCreate(**user_in.model_dump())
    
    # Make the first user a superadmin
    if user_crud.count(db) == 0:
        create_data.role = UserRole.superadmin
        
    new_user = user_crud.create(db, obj_in=create_data)
    return ApiResponse(message="User registered successfully", data=new_user)

@router.post("/send-otp", response_model=ApiResponse[None])
async def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)) -> Any:
    """
    Send an OTP to the user's email for password reset.
    """
    user = user_crud.get_by_email(db, email=req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # generate OTP
    otp_code = "".join(random.choices(string.digits, k=6))
    
    user.otp_code = otp_code
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()
    
    # Send Email
    try:
        await send_otp_email(email_to=req.email, otp_code=otp_code)
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email")
        
    return ApiResponse(message="OTP sent to email", data=None)

@router.post("/reset-password", response_model=ApiResponse[None])
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)) -> Any:
    """
    Verify OTP and reset password.
    """
    user = user_crud.get_by_email(db, email=req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.otp_code or user.otp_code != req.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    if not user.otp_expires_at or user.otp_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
        
    # Update user password
    user.hashed_password = get_password_hash(req.new_password)
    
    # Clear OTP
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    return ApiResponse(message="Password reset successfully", data=None)
