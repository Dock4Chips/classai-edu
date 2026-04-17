from pydantic import BaseModel, Field
from typing import Optional
from typing import List


class ModelConfigCreateUpdateSchema(BaseModel):
    model_name:   Optional[str] = Field(None, max_length=100)
    model_version: Optional[str] = Field(None, max_length=50)
    model_path:  Optional[str] = Field(None, max_length=100)
    model_size_mb: Optional[float] = None
    input_size: Optional[int] = 640
    num_classes: Optional[int] = 0
    inference_time_ms: Optional[int] = None
    map50: Optional[float] = None
    map50_95: Optional[float] = None
    training_epochs: Optional[int] = None
    is_default: Optional[bool] = False
    is_active: Optional[bool] = True
    description: Optional[str] = None
    training_dataset: Optional[str] = None
    clear_fields: Optional[List[str]] = None

    class Config:
        extra = "forbid"
