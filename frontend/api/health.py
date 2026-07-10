"""Vercel serverless: GET /api/health

Safe diagnostics for production deploys — confirms which repo is live and
whether CFBD_API_KEY is visible to Python functions (without exposing it).
"""
from __future__ import annotations

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

_LIB = Path(__file__).resolve().parent / "_lib"
if str(_LIB) not in sys.path:
    sys.path.insert(0, str(_LIB))


def _json_response(handler: BaseHTTPRequestHandler, status: int, payload) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _handle() -> tuple[int, dict]:
    import config

    payload = {
        "ok": True,
        "cfbd": config.api_key_status(),
        "vercel": {
            "env": os.environ.get("VERCEL_ENV"),
            "target_env": os.environ.get("VERCEL_TARGET_ENV"),
            "project_id": os.environ.get("VERCEL_PROJECT_ID"),
            "deployment_id": os.environ.get("VERCEL_DEPLOYMENT_ID"),
            "url": os.environ.get("VERCEL_URL"),
            "production_url": os.environ.get("VERCEL_PROJECT_PRODUCTION_URL"),
            "region": os.environ.get("VERCEL_REGION"),
        },
        "git": {
            "provider": os.environ.get("VERCEL_GIT_PROVIDER"),
            "owner": os.environ.get("VERCEL_GIT_REPO_OWNER"),
            "repo": os.environ.get("VERCEL_GIT_REPO_SLUG"),
            "ref": os.environ.get("VERCEL_GIT_COMMIT_REF"),
            "sha": os.environ.get("VERCEL_GIT_COMMIT_SHA"),
        },
        "setup_hint": (
            "If cfbd.configured is false: Vercel → this project → Settings → "
            "Environment Variables → add CFBD_API_KEY (not VITE_*) → check "
            "Production → Save → Deployments → Redeploy latest Production."
        ),
    }
    return 200, payload


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        status, payload = _handle()
        _json_response(self, status, payload)

    def log_message(self, format, *args):  # noqa: A003
        return
