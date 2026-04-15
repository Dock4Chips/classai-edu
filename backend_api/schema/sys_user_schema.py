from pydantic import BaseModel, Field, EmailStr
from typing import Optional



class UserCreateSchema(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=50)
    email: Optional[EmailStr]
    password: str = Field(..., min_length=6)
    phone: Optional[str] = Field(None, max_length=20)
    role_id: Optional[int]
    avatar: Optional[str]
    class Config:
        extra = 'forbid'


class UserUpdateSchema(BaseModel):
    user_name: Optional[str] = Field(None, min_length=1, max_length=50)
    nick_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    sex: Optional[int] = None
    status: Optional[int] = None
    role_id: Optional[int] = None
    avatar: Optional[str] = None
    remark: Optional[str] = None
    class Config:
        extra = 'forbid'


class UserPasswordUpdateSchema(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    class Config:
        extra = 'forbid'


class UserListQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    user_name: Optional[str] = None
    email: Optional[str] = None
    class Config:
        extra = 'forbid'
