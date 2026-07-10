"""CFBD config for the Vercel serverless advanced-stats function."""
import os

# Strip whitespace/newlines — injected cloud secrets sometimes include a trailing \n.
API_KEY = (os.environ.get("CFBD_API_KEY") or "").strip() or None


def require_api_key():
    key = (os.environ.get("CFBD_API_KEY") or "").strip() or API_KEY
    if not key:
        raise RuntimeError(
            "CFBD_API_KEY is not set. Add it as a Vercel project environment variable."
        )
    return key


def get_headers():
    return {"Authorization": f"Bearer {require_api_key()}"}
