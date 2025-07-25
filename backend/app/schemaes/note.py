from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
import uuid


class TagOut(BaseModel):
    id: int
    tag_name: str

    class Config:
        orm_mode = True
        
class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    is_public: bool = False
    tag_names: List[str] = []


class NoteOut(BaseModel):
    id: int
    title: str
    content: Optional[str]
    is_public: bool
    created_at: datetime
    updated_at: datetime
    tags: List[TagOut]

    class Config:
        orm_mode = True


class NoteUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    is_public: Optional[bool]
    tag_names: Optional[List[str]]