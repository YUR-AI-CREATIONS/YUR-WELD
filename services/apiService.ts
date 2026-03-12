
import { User, Project, FileMetadata } from "../types";

// Change this to your actual backend URL (e.g., https://api.yur.ai)
const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// ── SSO Auth Headers (reads from shared YUR SSO session in localStorage) ──
const SSO_STORAGE_KEY = 'yur_sso_session';
const TRINITY_API_KEY = 'legmAPxqbF+YUn7JCZD7zXbujSTRbkmhsWk1rHhKBzQ';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SSO_STORAGE_KEY);
    if (!raw) return { 'x-api-key': TRINITY_API_KEY };
    const session = JSON.parse(raw);
    const token = session?.access_token || '';
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'x-api-key': TRINITY_API_KEY,
    };
  } catch {
    return { 'x-api-key': TRINITY_API_KEY };
  }
}

export class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'NETWORK_ERROR' }));
      throw new Error(error.message || 'GATEWAY_TIMEOUT');
    }
    return response.json();
  }

  // AUTHENTICATION
  async authenticate(email: string, pass: string, mode: 'signin' | 'signup'): Promise<User> {
    // In a real backend, this would return a JWT and user object
    return this.request(`/api/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify({ email, pass }),
    });
  }

  // BILLING
  async createStripeSession(): Promise<{ url: string }> {
    return this.request('/api/billing/create-checkout-session', {
      method: 'POST',
    });
  }

  async syncSubscriptionStatus(): Promise<Partial<User>> {
    return this.request('/api/billing/status');
  }

  // PERSISTENCE
  async saveProject(project: Project): Promise<void> {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async fetchProjects(): Promise<Project[]> {
    return this.request('/api/projects');
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

// ── TRINITY GOVERNANCE API ──────────────────────────────────────
const TRINITY_API = 'https://yur-ai-api.onrender.com';

export async function fetchGovernancePolicies() {
  const res = await fetch(`${TRINITY_API}/governance/policies`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`GOVERNANCE_POLICIES_ERROR: ${res.status}`);
  return res.json();
}

export async function submitGovernanceReview(query: string, context: Record<string, unknown> = {}) {
  const res = await fetch(`${TRINITY_API}/governance/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ query, context }),
  });
  if (!res.ok) throw new Error(`GOVERNANCE_REVIEW_ERROR: ${res.status}`);
  return res.json();
}

export async function fetchGovernanceProtocols() {
  const res = await fetch(`${TRINITY_API}/governance/protocols`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`GOVERNANCE_PROTOCOLS_ERROR: ${res.status}`);
  return res.json();
}
