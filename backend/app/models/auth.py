from sqlalchemy import String,Column
from app.config import Base
import uuid
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from uuid import UUID

class User(Base):    
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    first_name: Mapped[str] = mapped_column(String, index=True)
    last_name: Mapped[str] = mapped_column(String, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)
