# app/routers/notes.py
import secrets
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
from app.schemaes.note import NoteCreate, NoteOut, NoteUpdate, PublicLinkRequest, PublicLinkResponse, ShareNoteRequest, ShareNoteResponse, SharedNoteOut
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi_pagination import Page, Params
from fastapi import Query

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


def get_visibility(n):
    if n.is_public:
        return "public"
    elif n.shared_entries:
        return "shared"
    else:
        return "private"


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
    )
    db.add(note)
    db.flush()

    # Handle tags
    for t in data.tag_names:
        tag = db.query(Tag).filter(func.lower(
            Tag.tag_name) == t.lower()).first()
        if not tag:
            tag = Tag(tag_name=t.lower())
            db.add(tag)
            db.flush()
        db.add(NoteTag(note_id=note.id, tag_id=tag.id))

    db.commit()
    db.refresh(note)
    return note


@router.get("/", response_model=Page[NoteOut])
def list_notes(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
) -> Page[NoteOut]:
    payload = decode_access_token(token)
    user_id: int = int(payload.get("user_id"))

    stmt = (
        db.query(Note)
        .options(
            selectinload(Note.shared_entries),
            selectinload(Note.tags).load_only(Tag.tag_name)
        )
        .filter(Note.user_id == user_id)
    )
    params = Params(page=page, size=size)

    return paginate(
        stmt,
        params=params,
        transformer=lambda items: [
            NoteOut(
                id=n.id,
                title=n.title,
                content=n.content,
                visibility=get_visibility(n),
                created_at=n.created_at,
                updated_at=n.updated_at,
                tags=[t.tag_name for t in n.tags],
            )
            for n in items
        ]
    )


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
            tag = db.query(Tag).filter(func.lower(
                Tag.tag_name) == t.lower()).first()
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
        q = q.join(NoteTag).join(Tag).filter(
            func.lower(Tag.tag_name) == tag.lower())

    notes = q.all()

    for n in notes:
        n.tag_names = [t.tag_name for t in n.tags]

    return notes


@router.post("/share", response_model=ShareNoteResponse)
def share_note(
    data: ShareNoteRequest,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Share a note with another user (read-only access)"""
    payload = decode_access_token(token)
    user_id = int(payload.get("user_id"))

    # Check if note exists and belongs to user
    note = db.query(Note).filter(
        Note.id == data.note_id,
        Note.user_id == user_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or you don't have permission"
        )

    # Find user to share with
    shared_with_user = db.query(User).filter(
        User.email == data.shared_with_user_email
    ).first()

    if not shared_with_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already shared
    existing_share = db.query(SharedNote).filter(
        SharedNote.note_id == data.note_id,
        SharedNote.shared_with_user_id == shared_with_user.id
    ).first()

    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note already shared with this user"
        )

    # Create share record
    shared_note = SharedNote(
        note_id=data.note_id,
        shared_by_user_id=user_id,
        shared_with_user_id=shared_with_user.id
    )

    db.add(shared_note)
    db.commit()
    db.refresh(shared_note)

    return shared_note


@router.post("/public-link", response_model=PublicLinkResponse)
def create_public_link(
    data: PublicLinkRequest,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Generate a public link for a note"""
    payload = decode_access_token(token)
    user_id = int(payload.get("user_id"))

    # Check if note exists and belongs to user
    note = db.query(Note).filter(
        Note.id == data.note_id,
        Note.user_id == user_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or you don't have permission"
        )

    # Generate token if doesn't exist
    if not note.public_token:
        note.public_token = secrets.token_urlsafe(32)
        note.is_public = True
        db.commit()
        db.refresh(note)

    public_url = f"https://127.0.0.1/public/notes/{note.public_token}"

    return PublicLinkResponse(
        public_url=public_url,
        token=note.public_token
    )


@router.get("/shared", response_model=List[SharedNoteOut])
def get_shared_notes(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Get notes shared with the current user"""
    payload = decode_access_token(token)
    user_id = int(payload.get("user_id"))

    # Get notes shared with current user
    shared_notes = db.query(Note).join(SharedNote).filter(
        SharedNote.shared_with_user_id == user_id
    ).all()

    result = []
    for note in shared_notes:
        shared_note_data = SharedNoteOut(
            id=note.id,
            title=note.title,
            content=note.content,
            owner_name=f"{note.owner.first_name} {note.owner.last_name}",
            shared_at=note.shared_entries[0].shared_at,  # Get first share date
            tags=note.tags
        )
        result.append(shared_note_data)

    return result


@router.get("/public/{token}")
def get_public_note(token: str, db: Session = Depends(get_db)):
    """Access a note via public token (no authentication required)"""
    note = db.query(Note).filter(
        Note.public_token == token,
        Note.is_public == True
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public note not found or access denied"
        )

    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "owner": f"{note.owner.first_name} {note.owner.last_name}",
        "created_at": note.created_at,
        "tags": note.tags
    }


@router.delete("/share/{share_id}")
def unshare_note(
    share_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Remove sharing access for a note"""
    payload = decode_access_token(token)
    user_id = int(payload.get("user_id"))

    # Find the share record
    shared_note = db.query(SharedNote).filter(
        SharedNote.id == share_id,
        SharedNote.shared_by_user_id == user_id
    ).first()

    if not shared_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share record not found or you don't have permission"
        )

    db.delete(shared_note)
    db.commit()

    return {"message": "Note unshared successfully"}


@router.delete("/public-link/{note_id}")
def remove_public_link(
    note_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Remove public access for a note"""
    payload = decode_access_token(token)
    user_id = int(payload.get("user_id"))

    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == user_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or you don't have permission"
        )

    note.public_token = None
    note.is_public = False
    db.commit()

    return {"message": "Public access removed successfully"}
