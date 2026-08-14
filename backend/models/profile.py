import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.user import User

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    skills: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    education: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    preferences_json: Mapped[dict] = mapped_column(
        JSONB, nullable=False, server_default=text("'{}'::jsonb")
    )

    # NOTE: nullable here (deviates from the literal schema doc) — see Batch 1
    # ambiguity flag #2. Onboarding allows "Skip for now" so a profile can
    # legitimately exist before a resume is uploaded.
    resume_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    resume_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resume_version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")
    resume_uploaded_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    resume_parse_status: Mapped[str] = mapped_column(
        String(50), nullable=False, server_default="PENDING"
    )
    vector_sync_status: Mapped[str] = mapped_column(
        String(50), nullable=False, server_default="PENDING"
    )

    user: Mapped["User"] = relationship(back_populates="profile") 