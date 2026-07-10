"""CFBD config for Vercel serverless functions."""
import os

# Primary name used in docs and data-engine/.env.example.
PRIMARY_ENV_NAME = "CFBD_API_KEY"

# Common alternate names users sometimes set in Vercel by mistake.
_FALLBACK_ENV_NAMES = (
    "COLLEGE_FOOTBALL_DATA_API_KEY",
    "CFBD_KEY",
    "COLLEGE_FOOTBALL_DATA_KEY",
)


def _clean(value):
    return (value or "").strip() or None


def resolve_api_key():
    """Return the first configured CFBD API key from known env var names."""
    for name in (PRIMARY_ENV_NAME, *_FALLBACK_ENV_NAMES):
        key = _clean(os.environ.get(name))
        if key:
            return key, name
    return None, None


# Module-level cache for cfbd_client.get_headers().
API_KEY, API_KEY_SOURCE = resolve_api_key()


def require_api_key():
    key, source = resolve_api_key()
    if not key:
        raise RuntimeError(
            "CFBD_API_KEY is not set. In Vercel → Project → Settings → "
            "Environment Variables, add CFBD_API_KEY for Production, then redeploy."
        )
    global API_KEY, API_KEY_SOURCE
    API_KEY = key
    API_KEY_SOURCE = source
    return key


def get_headers():
    return {"Authorization": f"Bearer {require_api_key()}"}


def api_key_status():
    """Safe runtime diagnostics (never exposes the secret)."""
    key, source = resolve_api_key()
    return {
        "configured": bool(key),
        "source_env_name": source,
        "checked_env_names": [PRIMARY_ENV_NAME, *_FALLBACK_ENV_NAMES],
    }
