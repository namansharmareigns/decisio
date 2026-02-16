"""Pydantic schemas for evaluation models."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID

from app.models.evaluation import RiskLevel


class DecisionContextSnapshotBase(BaseModel):
    """Base schema for DecisionContextSnapshot."""
    team_size_at_decision: int = Field(..., gt=0)
    expected_users_at_decision: int = Field(..., gt=0)
    timeline_at_decision: int = Field(..., gt=0)
    assumptions: Optional[str] = None


class DecisionContextSnapshotCreate(DecisionContextSnapshotBase):
    """Schema for creating DecisionContextSnapshot."""
    pass


class DecisionContextSnapshotResponse(DecisionContextSnapshotBase):
    """Schema for DecisionContextSnapshot response."""
    id: UUID
    decision_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class DecisionEvaluationBase(BaseModel):
    """Base schema for DecisionEvaluation."""
    drift_score: int = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    explanation: str


class DecisionEvaluationCreate(DecisionEvaluationBase):
    """Schema for creating DecisionEvaluation."""
    pass


class DecisionEvaluationResponse(DecisionEvaluationBase):
    """Schema for DecisionEvaluation response."""
    id: UUID
    decision_id: UUID
    evaluated_at: datetime
    
    class Config:
        from_attributes = True
