from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
    Integer
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from app.config.db import Base
import uuid
from uuid import UUID

class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[Optional[str]] = mapped_column(Text)
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        server_default="0",
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.current_timestamp(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="notes")
    tags: Mapped[List["Tag"]] = relationship(
        secondary="notetags",
        back_populates="notes",
    )
    shared_entries: Mapped[List["SharedNote"]] = relationship(
        back_populates="note",
        cascade="all, delete-orphan",
    )


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    tag_name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    # Relationships
    notes: Mapped[List["Note"]] = relationship(
        secondary="notetags",
        back_populates="tags",
    )


class NoteTag(Base):
    __tablename__ = "notetags"
    __table_args__ = (
        Index("idx_note_tag_unique", "note_id", "tag_id", unique=True),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    note_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("notes.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    tag_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )


class SharedNote(Base):
    __tablename__ = "sharednotes"
    __table_args__ = (
        Index(
            "idx_note_shared_with_unique",
            "note_id",
            "shared_with_user_id",
            unique=True,
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    note_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("notes.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    shared_by_user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    shared_with_user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    shared_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.current_timestamp(),
    )

    # Relationships
    note: Mapped["Note"] = relationship(back_populates="shared_entries")
    shared_by_user: Mapped["User"] = relationship(
        back_populates="shared_by",
        foreign_keys=[shared_by_user_id],
    )
    shared_with_user: Mapped["User"] = relationship(
        back_populates="shared_with",
        foreign_keys=[shared_with_user_id],
    )