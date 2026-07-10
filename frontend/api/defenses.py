"""Vercel serverless: GET /api/defenses

Returns FBS defensive havoc ratings for RankingsDashboard.
Computed live from CollegeFootballData (no Postgres required on Vercel).
"""
from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

_LIB = Path(__file__).resolve().parent / "_lib"
if str(_LIB) not in sys.path:
    sys.path.insert(0, str(_LIB))


def _json_response(handler: BaseHTTPRequestHandler, status: int, payload) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _handle(query: dict) -> tuple[int, object]:
    import os

    api_key = (os.environ.get("CFBD_API_KEY") or "").strip()
    if not api_key:
        return 503, {"detail": "CFBD_API_KEY is not configured on the server"}

    import config

    config.API_KEY = api_key

    year_raw = (query.get("year") or [None])[0]
    try:
        year = int(year_raw) if year_raw not in (None, "") else int(
            os.environ.get("DEFAULT_SCOUT_YEAR", "2025")
        )
    except ValueError:
        return 400, {"detail": "year must be an integer"}

    from cfbd_client import CfbdError
    from defense_stats import build_defenses

    try:
        return 200, build_defenses(year)
    except CfbdError as e:
        status = e.status_code if e.status_code in (401, 429) else 502
        return status, {"detail": str(e)}
    except Exception as e:
        return 500, {"detail": f"Defenses failed: {e}"}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        status, payload = _handle(query)
        _json_response(self, status, payload)

    def log_message(self, format, *args):  # noqa: A003
        return
