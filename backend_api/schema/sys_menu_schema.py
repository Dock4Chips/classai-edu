from pydantic import BaseModel, Field
from typing import Optional


class MenuListQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    menu_name: Optional[str] = Field(None, max_length=50)
    status: Optional[int] = Field(None)
    menu_type: Optional[str] = Field(None, max_length=1)


class MenuCreateUpdateSchema(BaseModel):
    menu_name: Optional[str] = Field(None, min_length=1, max_length=50)
    parent_id: Optional[int] = Field(0)
    order_num: Optional[int] = Field(0)
    path: Optional[str] = Field(None, max_length=200)
    menu_type: Optional[str] = Field(None, max_length=1)
    menu_key: Optional[str] = Field(None, max_length=100)
    icon: Optional[str] = Field(None, max_length=100)
    status: Optional[int] = Field(0)
    is_visible: Optional[int] = Field(1)
    remark: Optional[str] = Field(None, max_length=500)

    class Config:
        extra = 'forbid'


class RoleMenuAssignSchema(BaseModel):
    role_id: int = Field(..., description="角色ID")
    menu_ids: list[int] = Field(..., description="菜单ID列表")