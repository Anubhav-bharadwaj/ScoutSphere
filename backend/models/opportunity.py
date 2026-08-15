import uuid
from datetime import datetime
from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.application import Application

from backend.core.database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    requirements: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)
    
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="opportunity", cascade="all, delete-orphan"
    )

    @property
    def company(self) -> str:
        if self.source_url:
            from urllib.parse import urlparse
            domain = urlparse(self.source_url).netloc
            # remove www.
            if domain.startswith("www."):
                domain = domain[4:]
            return domain
        return "Unknown Company"
