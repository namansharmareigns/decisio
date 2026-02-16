"""Decision evaluation and snapshot models."""

import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class RiskLevel(str, enum.Enum):
    """Risk level enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DecisionContextSnapshot(Base):
    """Snapshot of project context at the time of decision."""
    
    __tablename__ = "decision_context_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    decision_id = Column(UUID(as_uuid=True), ForeignKey("decisions.id"), nullable=False)
    team_size_at_decision = Column(Integer, nullable=False)
    expected_users_at_decision = Column(Integer, nullable=False)
    timeline_at_decision = Column(Integer, nullable=False)
    assumptions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    decision = relationship("Decision", back_populates="snapshots")


class DecisionEvaluation(Base):
    """Evaluation result for a decision showing drift and risk."""
    
    __tablename__ = "decision_evaluations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    decision_id = Column(UUID(as_uuid=True), ForeignKey("decisions.id"), nullable=False)
    drift_score = Column(Integer, nullable=False)  # 0-100
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    explanation = Column(Text, nullable=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    decision = relationship("Decision", back_populates="evaluations")
