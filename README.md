# Dynasty Football

A college football dynasty/rookie draft scouting dashboard. It has two parts:

- **`frontend/`** — React + Vite single-page app. This is the UI: a home
  dashboard, defensive rankings, a playoff bracket, and a searchable player
  database with a per-player profile view.
- **`data-engine/`** — Python scripts that pull data from the
  [CollegeFootballData API](https://collegefootballdata.com/) and generate
  the data the frontend consumes, plus a FastAPI service backed by
  PostgreSQL for defensive matchup intel and player advanced stats.

## How the pieces connect

```
data-engine/fetch_directory.py  ─┐
data-engine/fetch_details.py    ─┴─► frontend/src/prospects.json ─► frontend (Players / Player Profile)
data-engine/matchup_data3.py    ────► PostgreSQL (defensive_intel) ─► GET /defenses ─► frontend (Defensive Rankings)
CollegeFootballData API (server-side only) ─► GET /players/advanced ─► frontend (Player Profile advanced stats)
```

**Defensive Rankings** has no hardcoded havoc/sacks/turnover numbers.
`RankingsDashboard.jsx` fetches `GET /defenses` on load and merges the live
numbers onto the frontend's static team metadata (name, brand color,
conference grouping) by team name — see
`frontend/src/utils/mergeDefenseStats.js`. If the API is unreachable, the
page still renders every team with `-` in place of missing stats.

**Player Profile advanced stats** (red-zone usage + betting context) are
computed in FastAPI (`GET /players/advanced`). The browser never talks to
CollegeFootballData and never holds a CFBD API key — only the backend does
(`CFBD_API_KEY` in `data-engine/.env`).

`frontend/src/prospects.json` is the one generated data file that's checked
into the repo, since the frontend reads it directly at build/run time.
Everything else `data-engine/*.py` scripts write out (raw CSV dumps, one-off
analysis files) is treated as disposable local output and is **not**
committed — rerun the relevant script to regenerate it.

The other `data-engine` scripts are standalone, interactive CLI research
tools used while scouting players and matchups. They aren't part of the
frontend's data pipeline, but each one prints (and saves a CSV of) a
different slice of stats:

| Script | What it reports |
|---|---|
| `player_game_log.py` | Per-game box score (passing/rushing/receiving, position-aware) + completion % + explosive play counts (runs > 15 yds, catches/throws > 20 yds) |
| `redzone_report.py` | Team red-zone trips computed from play-by-play (split into TDs vs. FGs) alongside the API's official trip/score numbers as a cross-check, plus the player's own red-zone touches/yards/TDs |
| `betting_report.py` | Spread, over/under, implied points, and a 1-10 relative difficulty rating vs. the team's own average line |
| `usage_report.py` | Touch share of all offensive snaps *and* a situational (game-script-neutral) touch share that excludes obvious-run downs |
| `scout_3rd_down.py` | 3rd-down passing conversion, player (from play-by-play) vs. team (official box score) |
| `matchup_data.py` | Per-team schedule difficulty: betting spread + opponent defensive "havoc" rating per game |
| `matchup_data3.py` | Bulk-loads every FBS team's defensive havoc rating into Postgres, powering `main.py`'s `/defenses` endpoint |
| `defense_intel.py` | Shared havoc-formula module used by both matchup scripts (not run directly) |
| `run_or_pass.py` | Weekly run/pass tendency breakdown by down and distance |
| `get_pbp_api.py` | Raw play-by-play fetch/inspection helper |
| `2024_stats.py` / `debug_stats.py` | Diagnostic pair that cross-checks CFBD numbers against an independent dataset (`2024_stats.py` downloads it, `debug_stats.py` digs into any mismatches) |

## Getting started

### 1. Database

`main.py` (FastAPI) and `matchup_data3.py` (the ETL that populates it) both
expect a PostgreSQL database with a `defensive_intel` table:

```bash
# Local Postgres, e.g.:
createdb postgres    # if it doesn't already exist
psql -d postgres -f data-engine/defensive_intel.sql
```

### 2. Data engine

```bash
cd data-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # add CFBD_API_KEY + DB credentials

python3 fetch_directory.py    # builds frontend/src/prospects.json
python3 fetch_details.py      # enriches it with game logs, etc.
python3 matchup_data3.py      # populates defensive_intel in Postgres

uvicorn main:app --reload     # starts the API on http://localhost:8000
```

Re-run `matchup_data3.py` periodically (e.g. weekly during the season) to
refresh the defensive stats — `main.py` just reads whatever is currently in
the table.

`CFBD_API_KEY` is required for scripts that call CollegeFootballData and for
`GET /players/advanced`. `GET /defenses` only needs Postgres.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # usually leave VITE_API_BASE_URL unset
npm run dev
```

By default the frontend calls **same-origin `/api`**:
- **Local:** Vite proxies `/api` → `http://localhost:8000` (run uvicorn)
- **Production (Vercel):** serverless functions under `frontend/api/`
  (the Vercel project Root Directory is `frontend`)

Only set `VITE_API_BASE_URL` if you host FastAPI somewhere else.
Do **not** put a CFBD key in any `VITE_*` variable — those are baked into the
browser bundle.

Get a free CollegeFootballData API key at
https://collegefootballdata.com/key and put it in `data-engine/.env` for local
dev, and as a **Vercel project env var** named `CFBD_API_KEY` for production
(Player Profile → Advanced uses `/api/players/advanced`).

### Vercel notes

- Project **Root Directory** must stay `frontend` (matches existing project settings).
- Build command / output are defined in `frontend/vercel.json`
  (`npm install && npm run build` → `dist`).
- Advanced stats function: `frontend/api/players/advanced.py`
- Defensive rankings function: `frontend/api/defenses.py` (live CFBD, no Postgres)

If a Vercel deploy still runs `npm install --prefix frontend`, clear any
**Override** Build/Install/Output settings in the Vercel project so it uses
`frontend/vercel.json` instead.

### Running tests

```bash
# Frontend merge-logic tests
cd frontend && npm test

# Backend advanced-stats unit tests (mocked CFBD)
cd data-engine && python3 -m unittest test_advanced_stats.py
```

## Notes

- Any API keys previously committed to this repository's git history should
  be considered compromised and rotated.
- `data-engine/venv/`, `*.csv` output files, and Python caches are
  git-ignored — do not commit them.
