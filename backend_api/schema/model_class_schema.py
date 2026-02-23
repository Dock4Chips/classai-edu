from pydantic import BaseModel
from typing import Optional, Dict


class ModelClassCreateSchema(BaseModel):
    model_id: int
    name: str
    description: Optional[str] = None
    extra_data: Optional[Dict] = None

class ModelClassUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    extra_data: Optional[Dict] = None