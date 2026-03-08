from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class DeveloperTechStack(Base):
    __tablename__ = "developer_tech_stacks"
    __table_args__ = (
        UniqueConstraint("developer_id", "tech_stack_id", name="uq_developer_tech_stack"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    developer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    tech_stack_id: Mapped[int] = mapped_column(ForeignKey("tech_stacks.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    developer: Mapped["User"] = relationship(back_populates="tech_stack_links")
    tech_stack: Mapped["TechStack"] = relationship(back_populates="developer_links")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    tech_stack_links: Mapped[list["DeveloperTechStack"]] = relationship(
        back_populates="developer", cascade="all, delete-orphan"
    )


class TechStack(Base):
    __tablename__ = "tech_stacks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    developer_links: Mapped[list[DeveloperTechStack]] = relationship(
        back_populates="tech_stack", cascade="all, delete-orphan"
    )
