"""API routes for Decision evaluation operations."""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.evaluation import DecisionContextSnapshot, DecisionEvaluation
from app.models.project_context import ProjectContext
from app.schemas.evaluation import (
    DecisionContextSnapshotCreate,
    DecisionContextSnapshotResponse,
    DecisionEvaluationResponse
)
from app.services.evaluation_service import EvaluationService

router = APIRouter(prefix="/decisions", tags=["evaluations"])


@router.get(
    "/{decision_id}/snapshots",
    response_model=List[DecisionContextSnapshotResponse]
)
def get_decision_snapshots(
    decision_id: UUID,
    db: Session = Depends(get_db)
) -> List[DecisionContextSnapshotResponse]:
    """Get all context snapshots for a decision (newest first)."""
    from app.models.decision import Decision
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision with id {decision_id} not found"
        )
    snapshots = db.query(DecisionContextSnapshot).filter(
        DecisionContextSnapshot.decision_id == decision_id
    ).order_by(DecisionContextSnapshot.created_at.desc()).all()
    return [DecisionContextSnapshotResponse.model_validate(s) for s in snapshots]


@router.post(
    "/{decision_id}/snapshot",
    response_model=DecisionContextSnapshotResponse,
    status_code=status.HTTP_201_CREATED
)
def create_decision_snapshot(
    decision_id: UUID,
    snapshot: DecisionContextSnapshotCreate,
    db: Session = Depends(get_db)
) -> DecisionContextSnapshotResponse:
    """Create a context snapshot for a decision."""
    # Verify decision exists
    from app.models.decision import Decision
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision with id {decision_id} not found"
        )
    
    # Create snapshot
    db_snapshot = DecisionContextSnapshot(
        decision_id=decision_id,
        **snapshot.model_dump()
    )
    db.add(db_snapshot)
    db.commit()
    db.refresh(db_snapshot)
    return DecisionContextSnapshotResponse.model_validate(db_snapshot)


@router.post(
    "/{decision_id}/evaluate",
    response_model=DecisionEvaluationResponse,
    status_code=status.HTTP_201_CREATED
)
def evaluate_decision(
    decision_id: UUID,
    db: Session = Depends(get_db)
) -> DecisionEvaluationResponse:
    """Evaluate a decision for drift."""
    try:
        evaluation = EvaluationService.evaluate_decision(db, decision_id)
        return evaluation
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/{decision_id}/evaluations",
    response_model=List[DecisionEvaluationResponse]
)
def get_decision_evaluations(
    decision_id: UUID,
    db: Session = Depends(get_db)
) -> List[DecisionEvaluationResponse]:
    """Get all evaluations for a decision."""
    evaluations = db.query(DecisionEvaluation).filter(
        DecisionEvaluation.decision_id == decision_id
    ).order_by(DecisionEvaluation.evaluated_at.desc()).all()
    
    return [DecisionEvaluationResponse.model_validate(e) for e in evaluations]
