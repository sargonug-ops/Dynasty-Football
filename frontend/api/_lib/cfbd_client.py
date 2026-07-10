"""Thin CollegeFootballData.com HTTP client used by the FastAPI backend.

Keeps the API key server-side (via config.py) and centralizes the few
endpoints the app needs so PlayerProfile no longer calls CFBD from the
browser.
"""
import requests
from config import get_headers

CFBD_BASE = "https://api.collegefootballdata.com"
DEFAULT_TIMEOUT = 30


class CfbdError(Exception):
    """Raised when a CFBD request fails or returns a non-2xx status."""

    def __init__(self, message, status_code=None):
        super().__init__(message)
        self.status_code = status_code


def _get(path, params=None):
    try:
        resp = requests.get(
            f"{CFBD_BASE}{path}",
            headers=get_headers(),
            params=params or {},
            timeout=DEFAULT_TIMEOUT,
        )
    except requests.RequestException as e:
        raise CfbdError(f"CFBD request failed: {e}") from e

    if resp.status_code == 401:
        raise CfbdError("CFBD rejected the API key (401 Unauthorized)", 401)
    if resp.status_code == 429:
        raise CfbdError("CFBD rate limit hit (429 Too Many Requests)", 429)
    if not resp.ok:
        raise CfbdError(
            f"CFBD {path} returned {resp.status_code}: {resp.text[:200]}",
            resp.status_code,
        )
    return resp.json()


def fetch_games(year, team, season_type="regular"):
    return _get("/games", {"year": year, "team": team, "seasonType": season_type})


def fetch_plays(year, team, week, season_type="regular"):
    params = {"year": year, "team": team, "week": week, "seasonType": season_type}
    return _get("/plays", params)


def fetch_lines(year, team):
    return _get("/lines", {"year": year, "team": team})
