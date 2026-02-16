"""API routes for Decision operations."""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.decision import Decision
from app.schemas.decision import DecisionCreate, DecisionUpdate, DecisionResponse

router = APIRouter(prefix="/decisions", tags=["decisions"])


@router.post("", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def create_decision(
    decision: DecisionCreate,
    db: Session = Depends(get_db)
) -> DecisionResponse:
    """Create a new decision."""
    db_decision = Decision(**decision.model_dump())
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)
    return DecisionResponse.model_validate(db_decision)


@router.get("", response_model=List[DecisionResponse])
def get_decisions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[DecisionResponse]:
    """Get all decisions."""
    decisions = db.query(Decision).offset(skip).limit(limit).all()
    return [DecisionResponse.model_validate(d) for d in decisions]


@router.get("/{decision_id}", response_model=DecisionResponse)
def get_decision(
    decision_id: UUID,
    db: Session = Depends(get_db)
) -> DecisionResponse:
    """Get a specific decision by ID."""
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision with id {decision_id} not found"
        )
    return DecisionResponse.model_validate(decision)
