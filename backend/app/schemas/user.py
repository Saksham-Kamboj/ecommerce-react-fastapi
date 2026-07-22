import uuid
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from enum import Enum


class UserRole(str, Enum):
    superadmin = "superadmin"
    user = "user"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True


class UserRegister(UserBase):
    password: str


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.user


# Admin-only update (can change role, is_active)
class UserUpdate(BaseModel):
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None


# Self-service profile update (user updates their own profile)
class UserUpdateSelf(BaseModel):
    # Account
    full_name: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=20)
    date_of_birth: date | None = None
    bio: str | None = Field(None, max_length=500)

    # Address is now handled separately


# Password change (separate endpoint for security)
class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True
    role: UserRole
    # Profile
    phone: str | None = None
    date_of_birth: date | None = None
    bio: str | None = None
    # Address is now handled separately
    created_at: datetime
    updated_at: datetime
