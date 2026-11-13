// Change this if your FastAPI server runs somewhere other than localhost:8000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : (import.meta.env.DEV ? 'http://localhost:8000' : '');

const TOKEN_KEY = 'flowgen_token';

// ── Auth Token Management ──────────────────────────────────────
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('Could not persist auth token:', err);
  }
}

function getAuthHeaders(isJson = false) {
  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// ── Authentication API ──────────────────────────────────────────
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Login failed (${res.status})`);
  }
  const data = await res.json();
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function registerUser(username, email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Registration failed (${res.status})`);
  }
  return await res.json();
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });
    if (!res.ok) {
      if (res.status === 401) {
        setAuthToken(null);
      }
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch user profile:', err);
    return null;
  }
}

// ── Project History & Analysis API ──────────────────────────────
export async function fetchProjects(searchTerm = '') {
  const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/projects${query}`, {
    method: 'GET',
    headers: getAuthHeaders(true),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Could not fetch projects (${res.status})`);
  }
  const data = await res.json();
  return data.projects || [];
}

export async function fetchProjectAnalysis(projectId) {
  const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/analysis`, {
    method: 'GET',
    headers: getAuthHeaders(true),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Could not load project analysis (${res.status})`);
  }
  return await res.json();
}

export async function deleteProject(projectId) {
  const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(true),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Could not delete project (${res.status})`);
  }
  return await res.json();
}

// ── Utilities & Uploads ─────────────────────────────────────────
export function isGitUrl(text) {
  return /^https?:\/\/\S+\.(git)$/i.test(text) ||
         /^https?:\/\/(www\.)?(github|gitlab|bitbucket)\.com\/\S+/i.test(text) ||
         /^git@\S+:\S+\.git$/i.test(text);
}

export async function uploadZip(file) {
  if (!file.name.toLowerCase().endsWith('.zip')) {
    throw new Error('Only .zip files are supported right now.');
  }
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/upload-zip`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  const result = await res.json();
  return { projectName: result.project_name || file.name, result };
}

export async function analyzeGitUrl(url) {
  const res = await fetch(`${API_BASE_URL}/api/analyze-git`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  const result = await res.json();
  return { projectName: result.project_name || url, result };
}

export function downloadResultsAsJson(result) {
  if (!result) return;
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${result.project_name || 'flowgen-analysis'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
