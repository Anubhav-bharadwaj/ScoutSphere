import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.models.user import User
    from backend.models.opportunity import Opportunity

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False
    )
    
    workflow_state: Mapped[str] = mapped_column(
        String(50), nullable=False, default="READY_TO_APPLY", index=True
    )
    kanban_stage: Mapped[str] = mapped_column(
        String(50), nullable=False, default="APPLIED"
    )
    
    form_payload: Mapped[dict] = mapped_column(
        JSONB, nullable=False, default=dict
    )
    next_action_note: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="applications")
    opportunity: Mapped["Opportunity"] = relationship("Opportunity", back_populates="applications")
