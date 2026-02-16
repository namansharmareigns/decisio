import { useEffect, useState } from 'react';
import { projectContextApi } from '../services/api';
import { ProjectContext, ProjectContextUpdate } from '../types';
import { Save, Users, Target, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectContextPage() {
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [formData, setFormData] = useState<ProjectContextUpdate>({
    team_size: undefined,
    expected_users: undefined,
    timeline_months: undefined,
    constraints: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProjectContext();
  }, []);

  const loadProjectContext = async () => {
    try {
      const data = await projectContextApi.get();
      setProjectContext(data);
      setFormData({
        team_size: data.team_size,
        expected_users: data.expected_users,
        timeline_months: data.timeline_months,
        constraints: data.constraints,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No context set yet, that's okay
        setProjectContext(null);
      } else {
        console.error('Error loading project context:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await projectContextApi.update(formData);
      setProjectContext(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update project context');
    } finally {
      setSaving(false);
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
      <h1 className="text-3xl font-bold text-slate-50 mb-8">Project Context</h1>

      <div className="card max-w-3xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-2">
            Current Project State
          </h2>
          <p className="text-slate-300">
            Keep your project context up to date to enable accurate decision drift detection.
          </p>
        </div>

        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-400/20 text-emerald-100 px-4 py-3 rounded-xl">
            Project context updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-400/20 text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {projectContext && (
          <div className="mb-6 p-4 bg-black/20 border border-white/10 rounded-2xl">
            <p className="text-sm text-slate-400 mb-2">Last updated:</p>
            <p className="text-sm font-semibold text-slate-50">
              {format(new Date(projectContext.updated_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Team Size
              </label>
              <input
                type="number"
                className="input"
                value={formData.team_size || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    team_size: parseInt(e.target.value) || undefined,
                  })
                }
                required
                min="1"
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label className="label flex items-center">
                <Target className="mr-2 h-4 w-4" />
                Expected Users
              </label>
              <input
                type="number"
                className="input"
                value={formData.expected_users || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expected_users: parseInt(e.target.value) || undefined,
                  })
                }
                required
                min="1"
                placeholder="e.g., 10000"
              />
            </div>

            <div>
              <label className="label flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Timeline (months)
              </label>
              <input
                type="number"
                className="input"
                value={formData.timeline_months || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeline_months: parseInt(e.target.value) || undefined,
                  })
                }
                required
                min="1"
                placeholder="e.g., 12"
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Constraints & Notes
            </label>
            <textarea
              className="input min-h-[120px]"
              value={formData.constraints || ''}
              onChange={(e) =>
                setFormData({ ...formData, constraints: e.target.value || null })
              }
              placeholder="Document any constraints, budget limitations, technical debt, or other relevant context..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Context'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 card max-w-3xl bg-primary-500/10 border border-primary-400/20">
        <h3 className="text-lg font-semibold text-slate-50 mb-2">
          How Project Context Works
        </h3>
        <ul className="space-y-2 text-sm text-slate-200/90">
          <li>
            • <strong>Team Size:</strong> Current number of team members working on the project
          </li>
          <li>
            • <strong>Expected Users:</strong> Anticipated number of end users or load
          </li>
          <li>
            • <strong>Timeline:</strong> Expected project duration in months
          </li>
          <li>
            • <strong>Constraints:</strong> Any limitations or important context that affects decisions
          </li>
        </ul>
        <p className="mt-4 text-sm text-slate-300">
          When you evaluate a decision, Decisio compares the current project context with the
          snapshot taken at decision time to detect drift and assess risk.
        </p>
      </div>
    </div>
  );
}
