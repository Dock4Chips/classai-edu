from pydantic import BaseModel, Field
from typing import Optional

class NoticeListQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    notice_title: Optional[str] = None
    notice_type: Optional[str] = None
    status: Optional[str] = None

class NoticeCreateUpdateSchema(BaseModel):
    notice_title: str
    notice_type: str
    status: Optional[str] = "0"
    content: Optional[str] = None