"""API routes for ProjectContext operations."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project_context import ProjectContext
from app.schemas.project_context import (
    ProjectContextCreate,
    ProjectContextUpdate,
    ProjectContextResponse
)

router = APIRouter(prefix="/project-context", tags=["project-context"])


@router.put("", response_model=ProjectContextResponse)
def update_project_context(
    context: ProjectContextUpdate,
    db: Session = Depends(get_db)
) -> ProjectContextResponse:
    """Create or update project context."""
    # Get latest context or create new one
    existing_context = db.query(ProjectContext).order_by(
        ProjectContext.updated_at.desc()
    ).first()
    
    if existing_context:
        # Update existing context
        update_data = context.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing_context, field, value)
        db.commit()
        db.refresh(existing_context)
        return ProjectContextResponse.model_validate(existing_context)
    else:
        # Create new context (requires all fields)
        if not all([context.team_size, context.expected_users, context.timeline_months]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="First context creation requires team_size, expected_users, and timeline_months"
            )
        new_context = ProjectContext(**context.model_dump(exclude_unset=True))
        db.add(new_context)
        db.commit()
        db.refresh(new_context)
        return ProjectContextResponse.model_validate(new_context)


@router.get("", response_model=ProjectContextResponse)
def get_project_context(
    db: Session = Depends(get_db)
) -> ProjectContextResponse:
    """Get current project context."""
    context = db.query(ProjectContext).order_by(
        ProjectContext.updated_at.desc()
    ).first()
    
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No project context found"
        )
    
    return ProjectContextResponse.model_validate(context)
