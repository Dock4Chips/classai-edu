from pydantic import BaseModel, Field
from typing import Optional


class RoleListQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    role_name: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=1)


class RoleCreateUpdateSchema(BaseModel):
    role_name: Optional[str] = Field(None, min_length=1, max_length=50)
    role_key: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, max_length=1)
    remark: Optional[str] = Field(None, max_length=500)

    class Config:
        extra = 'forbid'
