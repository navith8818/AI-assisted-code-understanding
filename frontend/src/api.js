// Change this if your FastAPI server runs somewhere other than localhost:8000
export const API_BASE_URL = 'http://localhost:8000';

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
    headers: { 'Content-Type': 'application/json' },
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
