"""Shared PostgreSQL connection config for main.py (FastAPI) and
matchup_data3.py (the ETL that populates defensive_intel).

Reads from the environment (or a local .env file, see .env.example) so the
same code works against a local dev Postgres and a hosted one without code
changes.
"""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DB_CONFIG = {
    "dbname": os.environ.get("DB_NAME", "postgres"),
    "user": os.environ.get("DB_USER", "jarvis"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": os.environ.get("DB_PORT", "5432"),
}
