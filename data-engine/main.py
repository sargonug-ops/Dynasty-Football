import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
from db_config import DB_CONFIG

app = FastAPI(title="Dynasty Football API")

# Comma-separated list of allowed origins, e.g. "http://localhost:5173,https://myapp.com"
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default season year for advanced scouting (overridable per-request).
DEFAULT_SCOUT_YEAR = int(os.environ.get("DEFAULT_SCOUT_YEAR", "2025"))


def get_db_connection():
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return None


@app.get("/")
def read_root():
    return {"message": "Welcome to the Dynasty Football API! 🏈"}


@app.get("/health")
def health_check():
    """Lightweight readiness check: confirms the API can reach Postgres."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=503, detail="Database unreachable")
    conn.close()
    return {"status": "ok"}


@app.get("/defenses")
def get_all_defenses():
    """Returns every team's defensive havoc rating, ordered by havoc_score.
    Populated by data-engine/matchup_data3.py."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=503, detail="Database connection failed")

    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM defensive_intel ORDER BY havoc_score DESC")
        rows = cursor.fetchall()
        cursor.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")
    finally:
        conn.close()


@app.get("/defenses/{team_name}")
def get_defense(team_name: str):
    """Returns a single team's defensive havoc rating (case-insensitive)."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=503, detail="Database connection failed")

    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT * FROM defensive_intel WHERE LOWER(team_name) = LOWER(%s)",
            (team_name,),
        )
        row = cursor.fetchone()
        cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail=f"No defensive data for '{team_name}'")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")
    finally:
        conn.close()


@app.get("/players/advanced")
def get_player_advanced_stats(
    name: str = Query(..., min_length=1, description="Player full name"),
    school: str = Query(..., min_length=1, description="School / team name"),
    position: str = Query("", description="Position (QB/RB/WR/TE) — affects RZ play filtering"),
    year: int = Query(None, description="Season year (defaults to DEFAULT_SCOUT_YEAR)"),
):
    """Server-side advanced scouting report (red zone + betting context).

    Proxies CollegeFootballData so the API key never reaches the browser.
    Returns the same per-game row shape PlayerProfile.jsx already renders.
    """
    from advanced_stats import build_advanced_stats
    from cfbd_client import CfbdError
    from config import API_KEY

    if not API_KEY:
        raise HTTPException(
            status_code=503,
            detail="CFBD_API_KEY is not configured on the server",
        )

    scout_year = year if year is not None else DEFAULT_SCOUT_YEAR

    try:
        rows = build_advanced_stats(name, school, position, scout_year)
        return {
            "player": name,
            "school": school,
            "position": position,
            "year": scout_year,
            "games": rows,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except CfbdError as e:
        status = e.status_code if e.status_code in (401, 429) else 502
        raise HTTPException(status_code=status, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced stats failed: {e}")
