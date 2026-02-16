"""Decision model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class DecisionType(str, enum.Enum):
    """Decision type enumeration."""
    ARCHITECTURE = "architecture"
    TECHNOLOGY = "technology"
    PROCESS = "process"


class ConfidenceLevel(str, enum.Enum):
    """Confidence level enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Decision(Base):
    """Decision model representing engineering decisions."""
    
    __tablename__ = "decisions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    decision_type = Column(SQLEnum(DecisionType), nullable=False)
    confidence_level = Column(SQLEnum(ConfidenceLevel), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    snapshots = relationship("DecisionContextSnapshot", back_populates="decision", cascade="all, delete-orphan")
    evaluations = relationship("DecisionEvaluation", back_populates="decision", cascade="all, delete-orphan")
