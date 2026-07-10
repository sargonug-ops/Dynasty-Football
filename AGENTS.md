# AGENTS.md

## Cursor Cloud specific instructions

This repo has two services (see `README.md` for the full architecture and the
standard install/run/test commands, which are accurate):

- `frontend/` — React + Vite SPA (dev server on port **5173**).
- `data-engine/` — Python FastAPI backend (`main.py`, port **8000**) plus CLI
  data scripts, backed by PostgreSQL.

The update script keeps dependencies fresh (`frontend` npm packages and the
`data-engine/venv`). System packages (PostgreSQL, `python3-venv`) and one-off
DB setup below are captured in the VM snapshot, not the update script.

### Starting services (non-obvious caveats)

- **PostgreSQL is not auto-started on VM boot.** Start it before running the
  backend or any DB script:
  `sudo pg_ctlcluster 16 main start`
- The DB is already provisioned in the snapshot: database `postgres`, a
  passwordless superuser role `jarvis`, `pg_hba.conf` set to `trust` for local
  connections (so the passwordless `jarvis` default in `.env.example` works),
  and the `defensive_intel` table from `data-engine/defensive_intel.sql`.
- **Backend:** from `data-engine/`, activate the venv (`source venv/bin/activate`)
  then `uvicorn main:app --reload --port 8000`. It reads `data-engine/.env`
  (copied from `.env.example`).
- **Frontend:** from `frontend/`, `npm run dev`. Reads `frontend/.env`
  (defaults to same-origin `/api`; Vite proxies that to `:8000` in local
  dev, Vercel serves `frontend/api/` serverless functions in production —
  the Vercel Root Directory is `frontend`).
  Production advanced stats need `CFBD_API_KEY` set in the Vercel project.

### Data / API keys

- `GET /defenses` and `/defenses/{team}` only need Postgres. The
  `defensive_intel` table is populated by `data-engine/matchup_data3.py`, which
  requires `CFBD_API_KEY`. Without a key you can seed the table directly for
  local testing.
- `GET /players/advanced` requires `CFBD_API_KEY` (set in `data-engine/.env` or
  as a `CFBD_API_KEY` secret). When unset it returns `503` by design; the rest
  of the app works without it since the player database reads the committed
  `frontend/src/prospects.json`.

### Lint

`cd frontend && npm run lint` currently reports pre-existing
`react-refresh/only-export-components` errors in `src/data.jsx`. These are
existing repo issues, not environment problems.
