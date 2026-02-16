export enum DecisionType {
  ARCHITECTURE = 'architecture',
  TECHNOLOGY = 'technology',
  PROCESS = 'process',
}

export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  decision_type: DecisionType;
  confidence_level: ConfidenceLevel;
  created_at: string;
  updated_at: string;
}

export interface ProjectContext {
  id: string;
  team_size: number;
  expected_users: number;
  timeline_months: number;
  constraints: string | null;
  updated_at: string;
}

export interface DecisionContextSnapshot {
  id: string;
  decision_id: string;
  team_size_at_decision: number;
  expected_users_at_decision: number;
  timeline_at_decision: number;
  assumptions: string | null;
  created_at: string;
}

export interface DecisionEvaluation {
  id: string;
  decision_id: string;
  drift_score: number;
  risk_level: RiskLevel;
  explanation: string;
  evaluated_at: string;
}

export interface DecisionCreate {
  title: string;
  description: string;
  decision_type: DecisionType;
  confidence_level: ConfidenceLevel;
}

export interface ProjectContextUpdate {
  team_size?: number;
  expected_users?: number;
  timeline_months?: number;
  constraints?: string | null;
}

export interface DecisionContextSnapshotCreate {
  team_size_at_decision: number;
  expected_users_at_decision: number;
  timeline_at_decision: number;
  assumptions?: string | null;
}
