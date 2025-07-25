# app/routers/notes.py
from typing import List, Optional
from uuid import UUID

from app.schemaes.auth import UserAuth
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, func

from app.config.db import get_db
from app.models.note import Note, Tag, NoteTag, SharedNote
from app.models.auth import User                       
from app.helper import decode_access_token, oauth2_scheme  
from app.schemaes.note import NoteCreate,NoteOut,NoteUpdate

router = APIRouter(prefix="/notes",
                   tags=["notes"])



def _get_note_for_user(
    note_id: UUID,
    token: str,
    db: Session,
    *,
    must_be_owner: bool = False,
) -> Note:
    """
    Returns the note if:
      * the current user is the owner, OR
      * the note is public, OR
      * the note has been shared with the current user.
    If must_be_owner=True, only the first condition is accepted.
    """
    payload = decode_access_token(token)
    user_id: int = int(payload.get("user_id"))
    note = (
        db.query(Note)
        .options(selectinload(Note.tags))
        .get(note_id)
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    is_owner = note.user_id == user_id
    if must_be_owner and not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not is_owner:
        if not note.is_public:
            shared = (
                db.query(SharedNote)
                .filter(
                    SharedNote.note_id == note_id,
                    SharedNote.shared_with_user_id == user_id,
                )
                .first()
            )
            if not shared:
                raise HTTPException(status_code=403, detail="Forbidden")
    return note

@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    data: NoteCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = decode_access_token(token)
    user_id: int = int(payload.get("user_id"))
    note = Note(
        user_id=user_id,
        title=data.title,
        content=data.content,
        is_public=data.is_public,
    )
    db.add(note)
    db.flush()  

    # Handle tags
    for t in data.tag_names:
        tag = db.query(Tag).filter(func.lower(Tag.tag_name) == t.lower()).first()
        if not tag:
            tag = Tag(tag_name=t.lower())
            db.add(tag)
            db.flush()
        db.add(NoteTag(note_id=note.id, tag_id=tag.id))

    db.commit()
    db.refresh(note)
    # note.tags = [t.tag_name for t in note.tags] 
    return note


@router.get("/", response_model=List[NoteOut])
def list_notes(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = decode_access_token(token)
    user_id: int = int(payload.get("user_id"))
    notes = (
        db.query(Note)
        .options(selectinload(Note.tags))
        .filter(Note.user_id == user_id)
        .all()
    )
    # flatten tags for response
    for n in notes:
        n.tag_names = [t.tag_name for t in n.tags]
    return notes


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    note = _get_note_for_user(note_id, token, db, must_be_owner=True)
    db.delete(note)
    db.commit()


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    note = _get_note_for_user(note_id, token, db, must_be_owner=True)

    for field, value in payload.dict(exclude_unset=True, exclude={"tag_names"}).items():
        setattr(note, field, value)

    # Handle tag changes if provided
    if payload.tag_names is not None:
        # 1. remove existing
        db.query(NoteTag).filter(NoteTag.note_id == note.id).delete()
        # 2. add new
        for t in payload.tag_names:
            tag = db.query(Tag).filter(func.lower(Tag.tag_name) == t.lower()).first()
            if not tag:
                tag = Tag(tag_name=t.lower())
                db.add(tag)
                db.flush()
            db.add(NoteTag(note_id=note.id, tag_id=tag.id))

    db.commit()
    db.refresh(note)
    note.tag_names = [t.tag_name for t in note.tags]
    return note



@router.get("/search", response_model=List[NoteOut])
def search_notes(
    title: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = decode_access_token(token)
    user_id: int = int(payload.get("user_id"))

    q = db.query(Note).options(selectinload(Note.tags))

    q = q.filter(
        or_(
            Note.user_id == user_id,
            Note.is_public.is_(True),
            Note.id.in_(
                db.query(SharedNote.note_id).filter(
                    SharedNote.shared_with_user_id == user_id
                )
            ),
        )
    )

    if title:
        q = q.filter(Note.title.ilike(f"%{title}%"))

    if tag:
        q = q.join(NoteTag).join(Tag).filter(func.lower(Tag.tag_name) == tag.lower())

    notes = q.all()

    for n in notes:
        n.tag_names = [t.tag_name for t in n.tags]

    return notes