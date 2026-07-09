"""Shared defensive "havoc" intel used by both matchup_data.py (per-team CLI
scouting report) and matchup_data3.py (bulk Postgres loader for main.py's
/defenses endpoint).

Previously this fetch + formula logic was copy-pasted between the two
scripts and had already started to drift; centralizing it here means a
change to the havoc formula only has to happen in one place.
"""
import requests
from config import HEADERS

YEAR = 2025

# Tracks: TFL, Sacks, INT, Passes Deflected, and Fumbles Recovered per team.
OPPONENT_INTEL = {}


def prefetch_defensive_intel(year=YEAR):
    """Fetches raw defensive stats for every FBS team for the given year."""
    print(f"🛡️  Scouting all FBS defenses for {year}...", end="\r")

    games_played = {}
    try:
        rec_url = "https://api.collegefootballdata.com/records"
        rec_resp = requests.get(rec_url, headers=HEADERS, params={"year": year})
        for team in rec_resp.json():
            g_count = team["total"]["games"]
            games_played[team["team"]] = max(1, g_count)
    except Exception:
        pass

    stats_url = "https://api.collegefootballdata.com/stats/season"
    try:
        resp = requests.get(stats_url, headers=HEADERS, params={"year": year})
        data = resp.json()

        for row in data:
            team = row["team"]
            stat = row["statName"]
            val = row["statValue"]

            if team not in OPPONENT_INTEL:
                OPPONENT_INTEL[team] = {
                    "tfl": 0, "sacks": 0, "int": 0, "pd": 0, "fumbles": 0,
                    "games": games_played.get(team, 1),
                }

            if stat == "tacklesForLoss": OPPONENT_INTEL[team]["tfl"] = val
            elif stat == "sacks": OPPONENT_INTEL[team]["sacks"] = val
            elif stat == "interceptions": OPPONENT_INTEL[team]["int"] = val
            elif stat == "passesDeflected": OPPONENT_INTEL[team]["pd"] = val
            elif stat == "fumblesRecovered": OPPONENT_INTEL[team]["fumbles"] = val
    except Exception:
        print("\n⚠️ Failed to fetch defensive stats.")
        return

    print("✅ Defensive Intel Loaded.                 ")


def get_havoc_rating(opponent):
    """Returns (havoc_score, sacks_per_game, turnovers_per_game).

    Havoc formula: (TFL + 2*Int + 2*Fumbles + 1.5*Sacks + PD) / Games
    """
    if opponent not in OPPONENT_INTEL:
        return 0, 0, 0

    s = OPPONENT_INTEL[opponent]
    g = s["games"]

    tfl, ints, fums, sacks, pd = s["tfl"], s["int"], s["fumbles"], s["sacks"], s["pd"]

    weighted_sum = tfl + (2 * ints) + (2 * fums) + (1.5 * sacks) + pd
    havoc_score = weighted_sum / g
    sacks_pg = sacks / g
    turnovers_pg = (ints + fums) / g

    return havoc_score, sacks_pg, turnovers_pg


def calculate_relative_rating(spread, avg_spread):
    """1-10 difficulty rating based on deviation from a team's average spread."""
    deviation = spread - avg_spread
    raw_rating = 5.5 + (deviation / 6.0)
    return int(round(max(1, min(10, raw_rating))))
