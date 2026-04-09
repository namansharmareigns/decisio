"""Service for evaluating decisions."""

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app.models.decision import Decision
from app.models.project_context import ProjectContext
from app.models.evaluation import DecisionContextSnapshot, DecisionEvaluation
from app.services.drift_engine import calculate_drift_score
from app.schemas.evaluation import DecisionEvaluationResponse


class EvaluationService:
    """Service for decision evaluation operations."""
    
    @staticmethod
    def evaluate_decision(
        db: Session,
        decision_id: UUID
    ) -> DecisionEvaluationResponse:
        """
        Evaluate a decision for drift.
        
        Args:
            db: Database session
            decision_id: ID of the decision to evaluate
            
        Returns:
            DecisionEvaluationResponse with drift analysis
            
        Raises:
            ValueError: If decision, context, or snapshot not found
        """
        # Fetch decision
        decision = db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision with id {decision_id} not found")
        
        # Fetch latest project context
        current_context = db.query(ProjectContext).order_by(
            ProjectContext.updated_at.desc()
        ).first()
        
        if not current_context:
            raise ValueError("No project context found. Please set project context first.")
        
        # Fetch latest snapshot for this decision
        snapshot = db.query(DecisionContextSnapshot).filter(
            DecisionContextSnapshot.decision_id == decision_id
        ).order_by(DecisionContextSnapshot.created_at.desc()).first()
        
        if not snapshot:
            raise ValueError(
                f"No context snapshot found for decision {decision_id}. "
                "Please create a snapshot first."
            )
        
        # Calculate drift
        drift_score, risk_level, explanation = calculate_drift_score(
            current_context,
            snapshot
        )
        
        # Create evaluation record
        evaluation = DecisionEvaluation(
            decision_id=decision_id,
            drift_score=drift_score,
            risk_level=risk_level,
            explanation=explanation
        )
        
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)
        
        return DecisionEvaluationResponse.model_validate(evaluation)
