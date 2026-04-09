import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { decisionsApi, projectContextApi } from '../services/api';
import { Decision, ProjectContext } from '../types';
import { FileText, Users, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [decisionsData, contextData] = await Promise.all([
        decisionsApi.getAll(),
        projectContextApi.get().catch(() => null),
      ]);
      setDecisions(decisionsData);
      setProjectContext(contextData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const recentDecisions = decisions.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-50 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <FileText className="h-6 w-6 text-primary-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-slate-300">Total Decisions</p>
              <p className="text-2xl font-bold text-slate-50">{decisions.length}</p>
            </div>
          </div>
        </div>

        {projectContext && (
          <>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Users className="h-6 w-6 text-emerald-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-300">Team Size</p>
                  <p className="text-2xl font-bold text-slate-50">{projectContext.team_size}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Clock className="h-6 w-6 text-sky-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-300">Timeline</p>
                  <p className="text-2xl font-bold text-slate-50">{projectContext.timeline_months} months</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Decisions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-50">Recent Decisions</h2>
          <Link to="/decisions" className="text-primary-300 hover:text-primary-200 text-sm font-semibold">
            View all →
          </Link>
        </div>

        {recentDecisions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-2 text-sm font-semibold text-slate-50">No decisions</h3>
            <p className="mt-1 text-sm text-slate-400">Get started by creating a new decision.</p>
            <div className="mt-6">
              <Link to="/decisions" className="btn btn-primary">
                Create Decision
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDecisions.map((decision) => (
              <Link
                key={decision.id}
                to={`/decisions/${decision.id}`}
                className="block p-4 border border-white/10 bg-black/10 rounded-2xl hover:border-primary-400/40 hover:bg-white/5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-50">{decision.title}</h3>
                    <p className="mt-1 text-sm text-slate-300 line-clamp-2">{decision.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
                      <span className="capitalize text-primary-200/90">{decision.decision_type}</span>
                      <span>•</span>
                      <span>Confidence: {decision.confidence_level}</span>
                      <span>•</span>
                      <span>{format(new Date(decision.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Project Context Warning */}
      {!projectContext && (
        <div className="mt-6 card border-l-4 border-yellow-400/70 bg-yellow-400/10">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-300" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-200">
                Project context not set
              </h3>
              <div className="mt-2 text-sm text-yellow-100/80">
                <p>Set up your project context to enable decision drift detection.</p>
              </div>
              <div className="mt-4">
                <Link to="/project-context" className="btn btn-primary text-sm">
                  Set Project Context
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
