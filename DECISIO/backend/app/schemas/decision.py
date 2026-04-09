"""Pydantic schemas for Decision model."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID

from app.models.decision import DecisionType, ConfidenceLevel


class DecisionBase(BaseModel):
    """Base schema for Decision."""
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    decision_type: DecisionType
    confidence_level: ConfidenceLevel


class DecisionCreate(DecisionBase):
    """Schema for creating a Decision."""
    pass


class DecisionUpdate(BaseModel):
    """Schema for updating a Decision."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    decision_type: Optional[DecisionType] = None
    confidence_level: Optional[ConfidenceLevel] = None


class DecisionResponse(DecisionBase):
    """Schema for Decision response."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
