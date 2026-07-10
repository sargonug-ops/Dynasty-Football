// Thin client for the Dynasty Football API.
//
// Resolution order:
//   1. VITE_API_BASE_URL (explicit override)
//   2. Same-origin `/api` — Vercel serverless in production, Vite proxy in local dev
//
// Do NOT default to http://localhost:8000 in production builds: that breaks
// the deployed site (browser tries to call the user's machine).
function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).replace(/\/$/, '');
  }
  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiGet(path) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch (err) {
    throw new ApiError(`Could not reach the API at ${API_BASE_URL} (${err.message})`, 0);
  }

  if (!response.ok) {
    throw new ApiError(`API request to ${path} failed with status ${response.status}`, response.status);
  }

  return response.json();
}

/**
 * Fetches every team's defensive intel (havoc score, sacks/game,
 * turnovers/game, last updated timestamp).
 * Production: Vercel `/api/defenses` (live CFBD).
 * Local: Vite proxy → FastAPI `/defenses` (Postgres via matchup_data3.py).
 */
export function fetchDefenses(year) {
  const qs = year != null ? `?year=${encodeURIComponent(year)}` : '';
  return apiGet(`/defenses${qs}`);
}

/**
 * Fetches the server-side advanced scouting report (red zone + betting
 * context) for one player. The FastAPI backend proxies CollegeFootballData
 * so the API key never reaches the browser.
 *
 * @param {{ name: string, school: string, position?: string, year?: number }} params
 */
export function fetchPlayerAdvancedStats({ name, school, position = '', year } = {}) {
  const qs = new URLSearchParams({ name, school });
  if (position) qs.set('position', position);
  if (year != null) qs.set('year', String(year));
  return apiGet(`/players/advanced?${qs.toString()}`);
}

export { ApiError, API_BASE_URL };
