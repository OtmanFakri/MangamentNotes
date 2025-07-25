from sqlalchemy import String,Column,Integer
from app.config import Base
import uuid
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from uuid import UUID
from sqlalchemy.orm import relationship
from typing import List

class User(Base):    
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )
    first_name: Mapped[str] = mapped_column(String, index=True)
    last_name: Mapped[str] = mapped_column(String, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)
    
    notes: Mapped[List["Note"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    shared_by: Mapped[List["SharedNote"]] = relationship(
        back_populates="shared_by_user",
        foreign_keys="SharedNote.shared_by_user_id",
        cascade="all, delete-orphan",
    )
    shared_with: Mapped[List["SharedNote"]] = relationship(
        "SharedNote",
        back_populates="shared_with_user",
        foreign_keys="[SharedNote.shared_with_user_id]",
    )