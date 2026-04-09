"""Pydantic schemas for ProjectContext model."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID


class ProjectContextBase(BaseModel):
    """Base schema for ProjectContext."""
    team_size: int = Field(..., gt=0)
    expected_users: int = Field(..., gt=0)
    timeline_months: int = Field(..., gt=0)
    constraints: Optional[str] = None


class ProjectContextCreate(ProjectContextBase):
    """Schema for creating ProjectContext."""
    pass


class ProjectContextUpdate(BaseModel):
    """Schema for updating ProjectContext."""
    team_size: Optional[int] = Field(None, gt=0)
    expected_users: Optional[int] = Field(None, gt=0)
    timeline_months: Optional[int] = Field(None, gt=0)
    constraints: Optional[str] = None


class ProjectContextResponse(ProjectContextBase):
    """Schema for ProjectContext response."""
    id: UUID
    updated_at: datetime
    
    class Config:
        from_attributes = True
