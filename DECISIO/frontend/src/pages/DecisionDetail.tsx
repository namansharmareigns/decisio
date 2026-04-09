import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  decisionsApi,
  evaluationApi,
  projectContextApi,
} from '../services/api';
import {
  Decision,
  DecisionContextSnapshot,
  DecisionEvaluation,
  ProjectContext,
  RiskLevel,
} from '../types';
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import CreateSnapshotModal from '../components/CreateSnapshotModal';

export default function DecisionDetail() {
  const { id } = useParams<{ id: string }>();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [snapshot, setSnapshot] = useState<DecisionContextSnapshot | null>(null);
  const [evaluations, setEvaluations] = useState<DecisionEvaluation[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      const [decisionData, contextData] = await Promise.all([
        decisionsApi.getById(id),
        projectContextApi.get().catch(() => null),
      ]);

      setDecision(decisionData);
      setProjectContext(contextData);

      // Load snapshot and evaluations
      try {
        const [snapshotsData, evaluationsData] = await Promise.all([
          evaluationApi.getSnapshots(id),
          evaluationApi.getEvaluations(id),
        ]);
        setEvaluations(evaluationsData);
        // Use latest snapshot (first in list, newest first)
        setSnapshot(snapshotsData.length > 0 ? snapshotsData[0] : null);
      } catch (error) {
        console.error('Error loading snapshots/evaluations:', error);
      }
    } catch (error) {
      console.error('Error loading decision:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!id) return;

    setEvaluating(true);
    try {
      const evaluation = await evaluationApi.evaluate(id);
      setEvaluations([evaluation, ...evaluations]);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to evaluate decision');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSnapshotCreated = () => {
    setShowSnapshotModal(false);
    loadData();
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW:
        return 'bg-emerald-500/10 text-emerald-100 border-emerald-400/20';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-500/10 text-yellow-100 border-yellow-400/20';
      case RiskLevel.HIGH:
        return 'bg-red-500/10 text-red-100 border-red-400/20';
      default:
        return 'bg-white/5 text-slate-100 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Decision not found</p>
        <Link to="/decisions" className="text-primary-300 hover:text-primary-200 mt-4 inline-block font-semibold">
          Back to Decisions
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/decisions"
        className="inline-flex items-center text-slate-300 hover:text-slate-50 mb-6 font-semibold"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Decisions
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">{decision.title}</h1>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-primary-500/15 text-primary-200 border border-primary-400/20 rounded-lg text-sm font-semibold capitalize">
                {decision.decision_type}
              </span>
              <span className="px-2 py-1 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-sm font-semibold capitalize">
                {decision.confidence_level} confidence
              </span>
              <span className="text-sm text-slate-400">
                Created {format(new Date(decision.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-50 mb-2">Description</h2>
          <p className="text-slate-200/90 whitespace-pre-wrap">{decision.description}</p>
        </div>
      </div>

      {/* Snapshot Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-50">Context Snapshot</h2>
          {!snapshot && (
            <button
              onClick={() => setShowSnapshotModal(true)}
              className="btn btn-primary"
            >
              Create Snapshot
            </button>
          )}
        </div>

        {snapshot ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">Team Size</p>
              <p className="text-lg font-semibold">{snapshot.team_size_at_decision}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Expected Users</p>
              <p className="text-lg font-semibold">{snapshot.expected_users_at_decision.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Timeline</p>
              <p className="text-lg font-semibold">{snapshot.timeline_at_decision} months</p>
            </div>
            {snapshot.assumptions && (
              <div className="md:col-span-3">
                <p className="text-sm text-slate-400 mb-1">Assumptions</p>
                <p className="text-slate-200/90">{snapshot.assumptions}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p>No snapshot created yet. Create one to enable drift detection.</p>
          </div>
        )}
      </div>

      {/* Evaluation Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-50">Drift Evaluation</h2>
          {snapshot && projectContext && (
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="btn btn-primary"
            >
              {evaluating ? 'Evaluating...' : 'Evaluate Decision'}
            </button>
          )}
        </div>

        {!snapshot && (
          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-300 mr-2" />
              <p className="text-sm text-yellow-100/90">
                Create a context snapshot first to enable drift evaluation.
              </p>
            </div>
          </div>
        )}

        {!projectContext && (
          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-300 mr-2" />
              <p className="text-sm text-yellow-100/90">
                Set project context first to enable drift evaluation.
              </p>
            </div>
          </div>
        )}

        {evaluations.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No evaluations yet. Run an evaluation to check for decision drift.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className={`border-2 rounded-lg p-4 ${getRiskColor(evaluation.risk_level)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold capitalize">{evaluation.risk_level} Risk</span>
                      <span>•</span>
                      <span className="font-medium">Drift Score: {evaluation.drift_score}/100</span>
                    </div>
                    <p className="text-sm opacity-90">
                      {format(new Date(evaluation.evaluated_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  {evaluation.risk_level === RiskLevel.HIGH && (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                  {evaluation.risk_level === RiskLevel.LOW && (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>
                <p className="mt-2 text-sm">{evaluation.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSnapshotModal && id && (
        <CreateSnapshotModal
          decisionId={id}
          projectContext={projectContext}
          onClose={() => setShowSnapshotModal(false)}
          onSuccess={handleSnapshotCreated}
        />
      )}
    </div>
  );
}
