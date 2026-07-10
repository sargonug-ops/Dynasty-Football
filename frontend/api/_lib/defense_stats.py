"""Build defensive havoc ratings from CollegeFootballData (no Postgres).

Same formula as data-engine/defense_intel.py:
  havoc = (TFL + 2*INT + 2*Fumbles + 1.5*Sacks + PD) / Games
"""
from __future__ import annotations

from datetime import datetime, timezone

from cfbd_client import CfbdError, _get


def build_defenses(year: int) -> list[dict]:
    """Return rows shaped for RankingsDashboard / mergeDefenseStats.js."""
    games_played: dict[str, int] = {}
    try:
        for team in _get("/records", {"year": year}):
            name = team.get("team")
            if not name:
                continue
            total = (team.get("total") or {}).get("games") or 0
            games_played[name] = max(1, int(total))
    except CfbdError:
        # Fall through; we'll still try season stats and default games=1.
        pass

    intel: dict[str, dict] = {}
    for row in _get("/stats/season", {"year": year}):
        team = row.get("team")
        if not team:
            continue
        if team not in intel:
            intel[team] = {
                "tfl": 0,
                "sacks": 0,
                "int": 0,
                "pd": 0,
                "fumbles": 0,
                "games": games_played.get(team, 1),
            }
        stat = row.get("statName")
        val = row.get("statValue") or 0
        try:
            val = float(val)
        except (TypeError, ValueError):
            val = 0

        if stat == "tacklesForLoss":
            intel[team]["tfl"] = val
        elif stat == "sacks":
            intel[team]["sacks"] = val
        elif stat == "interceptions":
            intel[team]["int"] = val
        elif stat == "passesDeflected":
            intel[team]["pd"] = val
        elif stat == "fumblesRecovered":
            intel[team]["fumbles"] = val

    now = datetime.now(timezone.utc).isoformat()
    rows = []
    for team, s in intel.items():
        g = max(1, s["games"])
        havoc = (s["tfl"] + (2 * s["int"]) + (2 * s["fumbles"]) + (1.5 * s["sacks"]) + s["pd"]) / g
        rows.append({
            "team_name": team,
            "havoc_score": round(havoc, 2),
            "sacks_pg": round(s["sacks"] / g, 2),
            "turnovers_pg": round((s["int"] + s["fumbles"]) / g, 2),
            "updated_at": now,
            "year": year,
        })

    rows.sort(key=lambda r: r["havoc_score"], reverse=True)
    return rows
