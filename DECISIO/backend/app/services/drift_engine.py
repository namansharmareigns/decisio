"""Decision drift detection engine."""

from typing import Tuple
from app.models.evaluation import RiskLevel
from app.models.project_context import ProjectContext
from app.models.evaluation import DecisionContextSnapshot


def calculate_drift_score(
    current_context: ProjectContext,
    snapshot: DecisionContextSnapshot
) -> Tuple[int, RiskLevel, str]:
    """
    Calculate drift score based on changes in project context.
    
    Args:
        current_context: Current project context
        snapshot: Snapshot of context at decision time
        
    Returns:
        Tuple of (drift_score, risk_level, explanation)
    """
    drift_score = 0
    factors = []
    
    # Factor 1: Team size change
    team_size_change = current_context.team_size - snapshot.team_size_at_decision
    team_size_change_pct = abs(team_size_change) / max(snapshot.team_size_at_decision, 1) * 100
    
    if team_size_change_pct > 50:
        drift_score += 30
        factors.append(f"Team size changed by {team_size_change_pct:.1f}%")
    elif team_size_change_pct > 25:
        drift_score += 15
        factors.append(f"Team size changed by {team_size_change_pct:.1f}%")
    
    # Factor 2: Expected users change
    users_change = current_context.expected_users - snapshot.expected_users_at_decision
    users_change_pct = abs(users_change) / max(snapshot.expected_users_at_decision, 1) * 100
    
    if users_change_pct > 100:  # More than doubled
        drift_score += 35
        factors.append(f"Expected users changed by {users_change_pct:.1f}%")
    elif users_change_pct > 50:
        drift_score += 20
        factors.append(f"Expected users changed by {users_change_pct:.1f}%")
    elif users_change_pct > 25:
        drift_score += 10
        factors.append(f"Expected users changed by {users_change_pct:.1f}%")
    
    # Factor 3: Timeline change
    timeline_change = current_context.timeline_months - snapshot.timeline_at_decision
    timeline_change_pct = abs(timeline_change) / max(snapshot.timeline_at_decision, 1) * 100
    
    if timeline_change_pct > 50:
        drift_score += 35
        factors.append(f"Timeline changed by {timeline_change_pct:.1f}%")
    elif timeline_change_pct > 25:
        drift_score += 20
        factors.append(f"Timeline changed by {timeline_change_pct:.1f}%")
    
    # Ensure score is within 0-100 range
    drift_score = min(drift_score, 100)
    
    # Determine risk level
    if drift_score <= 30:
        risk_level = RiskLevel.LOW
    elif drift_score <= 70:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.HIGH
    
    # Build explanation
    if factors:
        explanation = f"Drift detected due to: {', '.join(factors)}. Score: {drift_score}/100."
    else:
        explanation = f"No significant drift detected. Score: {drift_score}/100."
    
    return drift_score, risk_level, explanation
