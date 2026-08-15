import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Float, text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.models.user import User
    from backend.models.opportunity import Opportunity


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score: Mapped[float] = mapped_column(Float, nullable=False, server_default="0.0")
    reason: Mapped[str | None] = mapped_column(String, nullable=True)
    strong_areas: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    missing_skills: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False
    )

    user: Mapped["User"] = relationship() # noqa: F821
    opportunity: Mapped["Opportunity"] = relationship() # noqa: F821
