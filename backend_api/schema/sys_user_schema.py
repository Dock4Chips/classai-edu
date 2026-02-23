from pydantic import BaseModel, Field, EmailStr
from typing import Optional



class UserCreateSchema(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=50)
    email: Optional[EmailStr]
    password: str = Field(..., min_length=6)
    phone: Optional[str] = Field(None, max_length=20)
    role_id: Optional[int]
    avatar: Optional[str]


class UserUpdateSchema(BaseModel):
    user_name: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr]
    phone: Optional[str] = Field(None, max_length=20)
    role_id: Optional[int]
    avatar: Optional[str]


class UserPasswordUpdateSchema(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class UserListQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    user_name: Optional[str] = None
    email: Optional[str] = None