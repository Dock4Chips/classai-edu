from pydantic import BaseModel, Field
from typing import Optional
import re


class ModelDrawConfigCreateSchema(BaseModel):
    model_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=50)
    type: Optional[str] = Field(None, max_length=30)
    color_hex: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    color_rgb: Optional[str] = Field(None, max_length=20, pattern=r'^\d{1,3},\d{1,3},\d{1,3}$')
    color_bgr: Optional[str] = Field(None, max_length=20, pattern=r'^\d{1,3},\d{1,3},\d{1,3}$')
    extra_data: Optional[dict] = None


class ModelDrawConfigUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[str] = Field(None, max_length=30)
    color_hex: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    color_rgb: Optional[str] = Field(None, max_length=20, pattern=r'^\d{1,3},\d{1,3},\d{1,3}$')
    color_bgr: Optional[str] = Field(None, max_length=20, pattern=r'^\d{1,3},\d{1,3},\d{1,3}$')
    extra_data: Optional[dict] = None