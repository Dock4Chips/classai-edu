from pydantic import BaseModel, Field
from typing import Optional


class ConfigQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    config_name: Optional[str] = Field(None, max_length=100)
    group_name: Optional[str] = Field(None, max_length=50)


class ConfigCreateSchema(BaseModel):
    config_name: str = Field(..., min_length=1, max_length=100)
    config_key: str = Field(..., min_length=1, max_length=100)
    config_value: str = Field(..., min_length=1, max_length=500)
    group_name: Optional[str] = Field(None, max_length=50)
    is_system: Optional[int] = Field(0, ge=0, le=1)


class ConfigUpdateSchema(BaseModel):
    config_name: Optional[str] = Field(None, min_length=1, max_length=100)
    config_key: Optional[str] = Field(None, min_length=1, max_length=100)
    config_value: Optional[str] = Field(None, min_length=1, max_length=500)
    group_name: Optional[str] = Field(None, max_length=50)
