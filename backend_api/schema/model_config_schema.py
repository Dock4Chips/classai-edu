from pydantic import BaseModel, Field
from typing import Optional, Dict


class ModelConfigCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    extra_data: Optional[Dict] = None


class ModelConfigUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    extra_data: Optional[Dict] = None