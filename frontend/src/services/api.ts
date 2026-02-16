import axios from 'axios';
import type {
  Decision,
  DecisionCreate,
  ProjectContext,
  ProjectContextUpdate,
  DecisionContextSnapshot,
  DecisionContextSnapshotCreate,
  DecisionEvaluation,
} from '../types';

/**
 * API base URL.
 *
 * - Local dev (Vite proxy / Docker Nginx proxy): leave unset => "/api/v1"
 * - Deployed frontend calling deployed backend directly:
 *   set VITE_API_BASE_URL="https://<your-backend-domain>/api/v1"
 */
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || '').toString().trim() || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Decisions API
export const decisionsApi = {
  getAll: async (): Promise<Decision[]> => {
    const response = await api.get<Decision[]>('/decisions');
    return response.data;
  },

  getById: async (id: string): Promise<Decision> => {
    const response = await api.get<Decision>(`/decisions/${id}`);
    return response.data;
  },

  create: async (data: DecisionCreate): Promise<Decision> => {
    const response = await api.post<Decision>('/decisions', data);
    return response.data;
  },
};

// Project Context API
export const projectContextApi = {
  get: async (): Promise<ProjectContext> => {
    const response = await api.get<ProjectContext>('/project-context');
    return response.data;
  },

  update: async (data: ProjectContextUpdate): Promise<ProjectContext> => {
    const response = await api.put<ProjectContext>('/project-context', data);
    return response.data;
  },
};

// Evaluation API
export const evaluationApi = {
  getSnapshots: async (
    decisionId: string
  ): Promise<DecisionContextSnapshot[]> => {
    const response = await api.get<DecisionContextSnapshot[]>(
      `/decisions/${decisionId}/snapshots`
    );
    return response.data;
  },

  createSnapshot: async (
    decisionId: string,
    data: DecisionContextSnapshotCreate
  ): Promise<DecisionContextSnapshot> => {
    const response = await api.post<DecisionContextSnapshot>(
      `/decisions/${decisionId}/snapshot`,
      data
    );
    return response.data;
  },

  evaluate: async (decisionId: string): Promise<DecisionEvaluation> => {
    const response = await api.post<DecisionEvaluation>(
      `/decisions/${decisionId}/evaluate`
    );
    return response.data;
  },

  getEvaluations: async (
    decisionId: string
  ): Promise<DecisionEvaluation[]> => {
    const response = await api.get<DecisionEvaluation[]>(
      `/decisions/${decisionId}/evaluations`
    );
    return response.data;
  },
};

export default api;
