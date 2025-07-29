from datetime import datetime
from pydantic import BaseModel
from typing import Any, List, Optional
import uuid


class TagOut(BaseModel):
    id: int
    tag_name: str

    class Config:
        orm_mode = True
        
class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    tag_names: List[str] = []


class NoteOut(BaseModel):
    id: int
    title: str
    content: Optional[str]
    visibility: str
    created_at: datetime
    updated_at: datetime
    tags: List[str]

    class Config:
        orm_mode = True


class NoteUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    tag_names: Optional[List[str]]
    
    

class ShareNoteRequest(BaseModel):
    note_id: int
    shared_with_user_email: str

class ShareNoteResponse(BaseModel):
    id: int
    note_id: int
    shared_with_user_id: int
    shared_at: datetime
    
    class Config:
        orm_mode = True

class PublicLinkRequest(BaseModel):
    note_id: int

class PublicLinkResponse(BaseModel):
    public_url: str
    token: str

class SharedNoteOut(BaseModel):
    id: int
    title: str
    content: Optional[str]
    owner_name: str
    shared_at: datetime
    # tags: List[TagOut]
    
    class Config:
        orm_mode = True