# Dynasty Football

A college football dynasty/rookie draft scouting dashboard. It has two parts:

- **`frontend/`** — React + Vite single-page app. This is the UI: a home
  dashboard, defensive rankings, a playoff bracket, and a searchable player
  database with a per-player profile view.
- **`data-engine/`** — Python scripts that pull data from the
  [CollegeFootballData API](https://collegefootballdata.com/) and generate
  the data the frontend consumes, plus a small FastAPI service backed by
  PostgreSQL for defensive matchup intel.

## How the pieces connect

```
data-engine/fetch_directory.py  ─┐
data-engine/fetch_details.py    ─┴─► frontend/src/prospects.json ─► frontend (Players / Player Profile)
data-engine/matchup_data3.py    ────► PostgreSQL (defensive_intel) ─► data-engine/main.py (FastAPI, not currently called by the frontend)
```

`frontend/src/prospects.json` is the one generated data file that's checked
into the repo, since the frontend reads it directly at build/run time.
Everything else `data-engine/*.py` scripts write out (raw CSV dumps, one-off
analysis files) is treated as disposable local output and is **not**
committed — rerun the relevant script to regenerate it.

The other `data-engine` scripts (`master_scout*.py`, `scout_3rd_down*.py`,
`redzone_stats.py`/`check_redzone.py`, `betting_data.py`, `target_share.py`,
etc.) are standalone exploratory/analysis tools used while researching
players and matchups. They aren't part of the frontend's data pipeline.

## Getting started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # add your CollegeFootballData API key
npm run dev
```

The player profile view calls the CollegeFootballData API directly from the
browser using `VITE_CFBD_API_KEY`.

### Data engine

```bash
cd data-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # add your CollegeFootballData API key
python3 fetch_directory.py   # builds frontend/src/prospects.json
python3 fetch_details.py     # enriches it with game logs, etc.
```

`main.py` (FastAPI) expects a local PostgreSQL database with a
`defensive_intel` table (see `defensive_intel.sql`) populated by
`matchup_data3.py`.

Get a free CollegeFootballData API key at
https://collegefootballdata.com/key.

## Notes

- Any API keys previously committed to this repository's git history should
  be considered compromised and rotated.
- `data-engine/venv/`, `*.csv` output files, and Python caches are
  git-ignored — do not commit them.
