"""Server-side advanced scouting report for a player.

Ports the logic that used to live in frontend PlayerProfile.jsx (which
called CollegeFootballData directly from the browser, exposing the API
key). Returns the same per-game red-zone + betting-context rows the UI
already knows how to render.
"""
from cfbd_client import fetch_games, fetch_plays, fetch_lines, CfbdError


def _is_valid_player_rz_play(play_type, is_qb):
    p_type = play_type or ""
    if is_qb:
        return any(x in p_type for x in ("Pass", "Rush", "Sack"))
    return any(x in p_type for x in ("Pass", "Rush", "Reception", "Touchdown"))


def _extract_spread(formatted):
    """Pull the first signed number out of a formattedSpread string."""
    import re
    if not formatted:
        return 0.0
    m = re.search(r"[-+]?\d*\.?\d+", formatted)
    return float(m.group(0)) if m else 0.0


def _build_game_map(team, year):
    game_map = {}
    weeks_to_fetch = set()

    for season_type in ("regular", "postseason"):
        games = fetch_games(year, team, season_type)
        for g in games:
            g_id = str(g.get("id"))
            start = g.get("startDate") or ""
            game_map[g_id] = {
                "date": start.split("T")[0] if start else "TBD",
                "opponent": g.get("awayTeam") if g.get("homeTeam") == team else g.get("homeTeam"),
                "week": g.get("week"),
                "season_type": season_type,
            }
            # Only fetch plays for games that have been played.
            if g.get("homePoints") is not None and g.get("week") is not None:
                weeks_to_fetch.add((season_type, g.get("week")))

    return game_map, weeks_to_fetch


def _process_red_zone(all_plays, player_name, is_qb):
    rz_data = {}

    for play in all_plays:
        g_id = str(play.get("gameId"))
        d_id = play.get("driveId")
        if g_id not in rz_data:
            rz_data[g_id] = {
                "team_rz_drives": set(),
                "team_td_drives": set(),
                "team_fg_drives": set(),
                "p_opps": 0,
                "p_yards": 0,
                "p_tds": 0,
            }
        d = rz_data[g_id]

        ytg = play.get("yardsToGoal")
        if ytg is None:
            continue
        try:
            ytg = int(ytg)
        except (TypeError, ValueError):
            continue

        p_type = play.get("playType") or ""
        p_text = play.get("playText") or ""

        if ytg <= 20:
            d["team_rz_drives"].add(d_id)
            if play.get("scoring"):
                if "Touchdown" in p_type:
                    d["team_td_drives"].add(d_id)
                if "Field Goal" in p_type:
                    d["team_fg_drives"].add(d_id)

            if player_name in p_text and _is_valid_player_rz_play(p_type, is_qb):
                d["p_opps"] += 1
                d["p_yards"] += play.get("yardsGained") or 0
                if "Touchdown" in p_type:
                    d["p_tds"] += 1

    return rz_data


def _process_betting(betting_lines, team):
    betting_map = {}

    for game in betting_lines:
        g_id = str(game.get("id"))
        lines = game.get("lines") or []
        if not lines:
            continue

        selected = next((l for l in lines if l.get("provider") == "consensus"), None)
        if selected is None:
            selected = next((l for l in lines if l.get("provider") == "DraftKings"), None)
        if selected is None:
            selected = lines[0]

        over_under_raw = selected.get("overUnder")
        try:
            over_under = float(over_under_raw) if over_under_raw is not None else None
        except (TypeError, ValueError):
            over_under = None

        fmt_spread = selected.get("formattedSpread") or ""
        if team in fmt_spread:
            my_spread = _extract_spread(fmt_spread)
        else:
            my_spread = -1 * _extract_spread(fmt_spread)

        implied = ((over_under - my_spread) / 2) if over_under is not None else None

        # Simple win-probability approx: 50% - (spread * 2%)
        win_prob = 50 - (my_spread * 2)
        win_prob = max(1, min(99, round(win_prob)))

        betting_map[g_id] = {
            "spread": fmt_spread or "-",
            "overUnder": over_under if over_under is not None else "-",
            "implied": implied if implied is not None else 0,
            "winProb": win_prob,
        }

    return betting_map


def _context_label(implied, avg_implied, win_prob):
    if implied and avg_implied and implied > (avg_implied * 1.15):
        return "Shootout"
    if implied and avg_implied and implied < (avg_implied * 0.85):
        return "Defensive"
    if win_prob > 85:
        return "Blowout Win"
    if win_prob < 15:
        return "Blowout Loss"
    return "Standard"


def build_advanced_stats(player_name, school, position, year):
    """Build the advanced scouting report for one player.

    Returns a list of per-game dicts matching the shape PlayerProfile.jsx
    already expects (id, date, opponent, trips, scores, team_tds, team_fgs,
    p_opps, p_yards, p_tds, spread, overUnder, implied, winProb, context).
    """
    if not player_name or not school:
        raise ValueError("player_name and school are required")

    is_qb = "QB" in (position or "").upper()

    game_map, weeks_to_fetch = _build_game_map(school, year)

    all_plays = []
    for season_type, week in sorted(weeks_to_fetch, key=lambda x: (x[0], x[1] or 0)):
        try:
            all_plays.extend(fetch_plays(year, school, week, season_type))
        except CfbdError:
            # A single week's plays failing shouldn't kill the whole report.
            continue

    rz_data = _process_red_zone(all_plays, player_name, is_qb)
    betting_map = _process_betting(fetch_lines(year, school), school)

    implied_values = [b["implied"] for b in betting_map.values() if b.get("implied")]
    avg_implied = (sum(implied_values) / len(implied_values)) if implied_values else 28.0

    empty_rz = {
        "team_rz_drives": set(),
        "team_td_drives": set(),
        "team_fg_drives": set(),
        "p_opps": 0,
        "p_yards": 0,
        "p_tds": 0,
    }
    empty_bet = {"spread": "-", "overUnder": "-", "implied": 0, "winProb": 50}

    rows = []
    for g_id, info in game_map.items():
        rz = rz_data.get(g_id, empty_rz)
        bet = betting_map.get(g_id, empty_bet)

        trips = len(rz["team_rz_drives"])
        tds = len(rz["team_td_drives"].intersection(rz["team_rz_drives"]))
        fgs = len(rz["team_fg_drives"].intersection(rz["team_rz_drives"]))

        if trips == 0 and rz["p_opps"] == 0 and bet["spread"] == "-":
            continue

        rows.append({
            "id": g_id,
            "date": info["date"],
            "opponent": info["opponent"] or "TBD",
            "trips": trips,
            "scores": tds + fgs,
            "team_tds": tds,
            "team_fgs": fgs,
            "p_opps": rz["p_opps"],
            "p_yards": rz["p_yards"],
            "p_tds": rz["p_tds"],
            "spread": bet["spread"],
            "overUnder": bet["overUnder"],
            "implied": bet["implied"],
            "winProb": bet["winProb"],
            "context": _context_label(bet["implied"], avg_implied, bet["winProb"]),
        })

    rows.sort(key=lambda r: r["date"])
    return rows
