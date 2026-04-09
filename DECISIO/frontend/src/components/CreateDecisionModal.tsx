import { useState } from 'react';
import { decisionsApi } from '../services/api';
import { DecisionType, ConfidenceLevel, DecisionCreate } from '../types';
import { X } from 'lucide-react';

interface CreateDecisionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDecisionModal({ onClose, onSuccess }: CreateDecisionModalProps) {
  const [formData, setFormData] = useState<DecisionCreate>({
    title: '',
    description: '',
    decision_type: DecisionType.ARCHITECTURE,
    confidence_level: ConfidenceLevel.MEDIUM,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await decisionsApi.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create decision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_20px_120px_rgba(0,0,0,0.65)] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-50">Create Decision</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-400/20 text-red-200 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="label">Title</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Use microservices architecture"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[120px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Describe the decision, its rationale, and context..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Decision Type</label>
              <select
                className="input"
                value={formData.decision_type}
                onChange={(e) => setFormData({ ...formData, decision_type: e.target.value as DecisionType })}
              >
                <option value={DecisionType.ARCHITECTURE}>Architecture</option>
                <option value={DecisionType.TECHNOLOGY}>Technology</option>
                <option value={DecisionType.PROCESS}>Process</option>
              </select>
            </div>

            <div>
              <label className="label">Confidence Level</label>
              <select
                className="input"
                value={formData.confidence_level}
                onChange={(e) => setFormData({ ...formData, confidence_level: e.target.value as ConfidenceLevel })}
              >
                <option value={ConfidenceLevel.LOW}>Low</option>
                <option value={ConfidenceLevel.MEDIUM}>Medium</option>
                <option value={ConfidenceLevel.HIGH}>High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
