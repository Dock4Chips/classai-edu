from pydantic import BaseModel, Field
from typing import Optional


class LoginLogQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    user_name: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=1)


class OnlineUserQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    user_name: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=1)
