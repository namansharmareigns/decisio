"""Project context model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ProjectContext(Base):
    """Project context model representing current project state."""
    
    __tablename__ = "project_contexts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_size = Column(Integer, nullable=False)
    expected_users = Column(Integer, nullable=False)
    timeline_months = Column(Integer, nullable=False)
    constraints = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
