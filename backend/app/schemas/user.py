import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

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

class UserUpdate(BaseModel):
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True
    role: UserRole
    created_at: datetime
    updated_at: datetime
