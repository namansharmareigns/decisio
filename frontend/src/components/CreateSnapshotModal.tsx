import { useState, useEffect } from 'react';
import { evaluationApi } from '../services/api';
import { DecisionContextSnapshotCreate, ProjectContext } from '../types';
import { X } from 'lucide-react';

interface CreateSnapshotModalProps {
  decisionId: string;
  projectContext: ProjectContext | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSnapshotModal({
  decisionId,
  projectContext,
  onClose,
  onSuccess,
}: CreateSnapshotModalProps) {
  const [formData, setFormData] = useState<DecisionContextSnapshotCreate>({
    team_size_at_decision: projectContext?.team_size || 1,
    expected_users_at_decision: projectContext?.expected_users || 1000,
    timeline_at_decision: projectContext?.timeline_months || 6,
    assumptions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectContext) {
      setFormData({
        team_size_at_decision: projectContext.team_size,
        expected_users_at_decision: projectContext.expected_users,
        timeline_at_decision: projectContext.timeline_months,
        assumptions: '',
      });
    }
  }, [projectContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        assumptions: formData.assumptions?.trim() || null,
      };
      await evaluationApi.createSnapshot(decisionId, payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create snapshot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_20px_120px_rgba(0,0,0,0.65)] max-w-2xl w-full mx-4">
        <div className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-50">Create Context Snapshot</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">Team Size</label>
              <input
                type="number"
                className="input"
                value={formData.team_size_at_decision}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    team_size_at_decision: parseInt(e.target.value) || 1,
                  })
                }
                required
                min="1"
              />
            </div>

            <div>
              <label className="label">Expected Users</label>
              <input
                type="number"
                className="input"
                value={formData.expected_users_at_decision}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expected_users_at_decision: parseInt(e.target.value) || 1000,
                  })
                }
                required
                min="1"
              />
            </div>

            <div>
              <label className="label">Timeline (months)</label>
              <input
                type="number"
                className="input"
                value={formData.timeline_at_decision}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeline_at_decision: parseInt(e.target.value) || 6,
                  })
                }
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="label">Assumptions (optional)</label>
            <textarea
              className="input min-h-[100px]"
              value={formData.assumptions || ''}
              onChange={(e) =>
                setFormData({ ...formData, assumptions: e.target.value })
              }
              placeholder="Document any assumptions or constraints at the time of this decision..."
            />
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
              {loading ? 'Creating...' : 'Create Snapshot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
