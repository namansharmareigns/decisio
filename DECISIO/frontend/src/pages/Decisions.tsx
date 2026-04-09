import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { decisionsApi } from '../services/api';
import { Decision, DecisionType, ConfidenceLevel } from '../types';
import { Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import CreateDecisionModal from '../components/CreateDecisionModal';

export default function Decisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    try {
      const data = await decisionsApi.getAll();
      setDecisions(data);
    } catch (error) {
      console.error('Error loading decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionCreated = () => {
    setShowCreateModal(false);
    loadDecisions();
  };

  const getTypeColor = (type: DecisionType) => {
    switch (type) {
      case DecisionType.ARCHITECTURE:
        return 'bg-accent-500/15 text-accent-200 border border-accent-400/20';
      case DecisionType.TECHNOLOGY:
        return 'bg-primary-500/15 text-primary-200 border border-primary-400/20';
      case DecisionType.PROCESS:
        return 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/20';
      default:
        return 'bg-white/5 text-slate-200 border border-white/10';
    }
  };

  const getConfidenceColor = (level: ConfidenceLevel) => {
    switch (level) {
      case ConfidenceLevel.HIGH:
        return 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/20';
      case ConfidenceLevel.MEDIUM:
        return 'bg-yellow-500/15 text-yellow-200 border border-yellow-400/20';
      case ConfidenceLevel.LOW:
        return 'bg-red-500/15 text-red-200 border border-red-400/20';
      default:
        return 'bg-white/5 text-slate-200 border border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-50">Decisions</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Decision
        </button>
      </div>

      {decisions.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-2 text-sm font-semibold text-slate-50">No decisions</h3>
          <p className="mt-1 text-sm text-slate-400">Get started by creating a new decision.</p>
          <div className="mt-6">
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create Decision
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {decisions.map((decision) => (
            <Link
              key={decision.id}
              to={`/decisions/${decision.id}`}
              className="card hover:border-primary-400/30 hover:bg-white/7 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-50 mb-2">{decision.title}</h3>
                  <p className="text-slate-300 mb-4 line-clamp-3">{decision.description}</p>
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getTypeColor(decision.decision_type)}`}>
                      {decision.decision_type}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getConfidenceColor(decision.confidence_level)}`}>
                      {decision.confidence_level} confidence
                    </span>
                    <span className="text-sm text-slate-400">
                      {format(new Date(decision.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateDecisionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleDecisionCreated}
        />
      )}
    </div>
  );
}
