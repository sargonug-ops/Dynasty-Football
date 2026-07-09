"""Shared configuration for data-engine scripts and the FastAPI backend.

Loads the CollegeFootballData API key from the environment (or a local
.env file, see .env.example). Importing this module does NOT raise if the
key is missing — that lets main.py start and serve /defenses without a
CFBD key. Accessing HEADERS (or calling require_api_key()) raises only
when a CFBD call is actually attempted.
"""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

API_KEY = os.environ.get("CFBD_API_KEY")


def require_api_key():
    """Raise if CFBD_API_KEY is not configured."""
    if not API_KEY:
        raise RuntimeError(
            "CFBD_API_KEY is not set. Copy data-engine/.env.example to "
            "data-engine/.env and add your CollegeFootballData API key."
        )
    return API_KEY


def get_headers():
    """Authorization headers for CollegeFootballData API requests."""
    return {"Authorization": f"Bearer {require_api_key()}"}


class _LazyHeaders:
    """Dict-like proxy so `from config import HEADERS` still works for CLI
    scripts, but the missing-key error only fires when a request is made."""

    def __getitem__(self, key):
        return get_headers()[key]

    def get(self, key, default=None):
        return get_headers().get(key, default)

    def keys(self):
        return get_headers().keys()

    def items(self):
        return get_headers().items()

    def values(self):
        return get_headers().values()

    def __iter__(self):
        return iter(get_headers())

    def __contains__(self, key):
        return key in get_headers()

    def copy(self):
        return dict(get_headers())


HEADERS = _LazyHeaders()
