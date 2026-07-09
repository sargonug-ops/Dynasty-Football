"""Red Zone Report — combines what used to be two separate scripts:

- redzone_stats.py: pulled the API's OFFICIAL pre-computed team red-zone
  trips/scores (games/teams endpoint)
- check_redzone.py: computed team red-zone trips from play-by-play directly,
  additionally splitting conversions into TDs vs FGs (a stat the official
  numbers don't break out)

This script reports both: the official trip/score counts (as a sanity check)
alongside the play-by-play-derived trips with the TD/FG split, plus the
player's own red-zone usage (opportunities, yards, TDs).
"""
import requests
import pandas as pd
import warnings
from dateutil import parser
from config import API_KEY, HEADERS

warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
YEAR = 2025


def search_player(name_query):
    print(f"🔍 Searching for '{name_query}'...", end="\r")
    url = "https://api.collegefootballdata.com/player/search"
    params = {"searchTerm": name_query, "year": YEAR}
    try:
        resp = requests.get(url, headers=HEADERS, params=params)
        results = resp.json()
        if not results:
            print(f"❌ No player found named '{name_query}'.")
            return None
        if len(results) == 1:
            return results[0]

        print(f"\n⚠️ Multiple players found:")
        for i, p in enumerate(results):
            print(f"   {i+1}. {p['name']} -- {p['team']} ({p['position']})")
        choice = input(f"Select # (1-{len(results)}): ")
        return results[int(choice) - 1]
    except Exception:
        return None


def get_schedule_map(team_name):
    schedule_map = {}
    url = "https://api.collegefootballdata.com/games"
    for season_type in ['regular', 'postseason']:
        try:
            resp = requests.get(url, headers=HEADERS, params={"year": YEAR, "team": team_name, "seasonType": season_type})
            for game in resp.json():
                g_id = str(game.get('id'))
                raw_date = game.get('startDate')
                fmt_date = "9999-12-31"
                if raw_date:
                    try: fmt_date = parser.parse(raw_date).strftime("%Y-%m-%d")
                    except Exception: pass

                home, away = game.get('homeTeam'), game.get('awayTeam')
                opp = away if home == team_name else home
                schedule_map[g_id] = {"date": fmt_date, "opponent": opp or "TBD"}
        except Exception:
            pass
    return schedule_map


def get_official_team_redzone_stats(team_name):
    """OFFICIAL red-zone trips/scores from the games/teams box score endpoint."""
    print(f"📊 Fetching Official Red Zone Stats for {team_name}...", end="\r")
    rz_stats = {}
    url = "https://api.collegefootballdata.com/games/teams"
    params = {"year": YEAR, "team": team_name}

    try:
        resp = requests.get(url, headers=HEADERS, params=params)
        for game in resp.json():
            g_id = str(game.get('id'))

            for team in game.get('teams', []):
                t_name = team.get('school') or team.get('team') or team.get('schoolName')
                if t_name == team_name:
                    trips, scores = 0, 0
                    for stat in team.get('stats', []):
                        cat = stat.get('category')
                        val = int(stat.get('stat', 0))
                        if cat == 'redzoneAttempts': trips = val
                        elif cat == 'redzoneScores': scores = val

                    if trips > 0:
                        rz_stats[g_id] = {"trips": trips, "scores": scores}
    except Exception:
        pass
    return rz_stats


def analyze_redzone_performance(player_data):
    """Computes team red-zone drives (with TD vs FG split) and player usage
    directly from play-by-play."""
    name = player_data['name']
    team = player_data['team']
    pos = player_data['position']
    print(f"📡 Scanning PBP for {name} ({pos}) inside the 20...", end="\r")

    game_data = {}
    url = "https://api.collegefootballdata.com/plays"

    for week in range(1, 16):
        try:
            resp = requests.get(url, headers=HEADERS, params={"year": YEAR, "team": team, "week": week})
            plays = resp.json()

            for play in plays:
                g_id = str(play.get('gameId'))
                drive_id = play.get('driveId')

                if g_id not in game_data:
                    game_data[g_id] = {
                        "team_rz_drives": set(),
                        "team_td_drives": set(),
                        "team_fg_drives": set(),
                        "p_opps": 0, "p_yards": 0, "p_tds": 0,
                    }

                ytg = play.get('yardsToGoal')
                if ytg is not None and int(ytg) <= 20:
                    game_data[g_id]["team_rz_drives"].add(drive_id)

                    if play.get('scoring') is True:
                        p_type = play.get('playType', '')
                        if "Touchdown" in p_type:
                            game_data[g_id]["team_td_drives"].add(drive_id)
                        elif "Field Goal" in p_type:
                            game_data[g_id]["team_fg_drives"].add(drive_id)

                    p_text = play.get('playText', '')
                    if name in p_text:
                        p_type = play.get('playType', '')
                        is_valid = False
                        if pos == 'QB':
                            if any(x in p_type for x in ['Pass', 'Rush', 'Sack']): is_valid = True
                        else:
                            if any(x in p_type for x in ['Pass', 'Rush', 'Reception']): is_valid = True

                        if is_valid:
                            game_data[g_id]['p_opps'] += 1
                            game_data[g_id]['p_yards'] += play.get('yardsGained', 0)
                            if "Touchdown" in p_type:
                                game_data[g_id]['p_tds'] += 1
        except Exception:
            pass

    return game_data


def run_analysis():
    p_data = search_player(input("\nEnter Player Name: ").strip())
    if not p_data:
        return

    game_map = get_schedule_map(p_data['team'])
    official_stats = get_official_team_redzone_stats(p_data['team'])
    computed_stats = analyze_redzone_performance(p_data)

    rows = []
    s_trips = s_team_tds = s_team_fgs = 0
    s_off_trips = s_off_scores = 0
    s_opps = s_yds = s_tds = 0

    sorted_games = sorted(game_map.items(), key=lambda x: x[1]['date'])

    for g_id, info in sorted_games:
        stats = computed_stats.get(g_id)
        official = official_stats.get(g_id, {'trips': 0, 'scores': 0})

        if stats:
            t_trips = len(stats['team_rz_drives'])
            rz_tds = len(stats['team_td_drives'].intersection(stats['team_rz_drives']))
            rz_fgs = len(stats['team_fg_drives'].intersection(stats['team_rz_drives']))
            rz_total_scores = rz_tds + rz_fgs
            p_opps = stats['p_opps']

            if t_trips > 0 or p_opps > 0 or official['trips'] > 0:
                t_pct = (rz_total_scores / t_trips * 100) if t_trips > 0 else 0.0

                s_trips += t_trips
                s_team_tds += rz_tds
                s_team_fgs += rz_fgs
                s_off_trips += official['trips']
                s_off_scores += official['scores']
                s_opps += p_opps
                s_yds += stats['p_yards']
                s_tds += stats['p_tds']

                rows.append({
                    "Date": info['date'],
                    "Opponent": info['opponent'],
                    "Team_Trips_PBP": t_trips,
                    "Team_TDs": rz_tds,
                    "Team_FGs": rz_fgs,
                    "Team_Conv_PBP": f"{t_pct:.0f}%",
                    "Team_Trips_Official": official['trips'],
                    "Team_Scores_Official": official['scores'],
                    "Pl_Opps": p_opps,
                    "Pl_Yds": stats['p_yards'],
                    "Pl_TDs": stats['p_tds'],
                })

    if rows:
        df = pd.DataFrame(rows)
        print("\n" + "="*135)
        print(f"🚨 RED ZONE REPORT: {p_data['name'].upper()} ({p_data['position']})")
        print(f"{'DATE':<12} {'OPPONENT':<20} | {'PBP TRIPS':<9} {'TDS':<3} {'FGS':<3} {'CONV %':<6} | "
              f"{'OFF TRIPS':<9} {'OFF SCR':<7} | {'PL OPPS':<8} {'YDS':<5} {'TDS':<5}")
        print("-" * 135)

        for _, r in df.iterrows():
            print(f"{r['Date']:<12} {r['Opponent']:<20} | {r['Team_Trips_PBP']:<9} {r['Team_TDs']:<3} "
                  f"{r['Team_FGs']:<3} {r['Team_Conv_PBP']:<6} | {r['Team_Trips_Official']:<9} "
                  f"{r['Team_Scores_Official']:<7} | {r['Pl_Opps']:<8} {r['Pl_Yds']:<5} {r['Pl_TDs']:<5}")

        print("-" * 135)
        total_pct = (s_team_tds + s_team_fgs) / s_trips * 100 if s_trips > 0 else 0.0
        print(f"{'TOTAL':<34} | {s_trips:<9} {s_team_tds:<3} {s_team_fgs:<3} {f'{total_pct:.0f}%':<6} | "
              f"{s_off_trips:<9} {s_off_scores:<7} | {s_opps:<8} {s_yds:<5} {s_tds:<5}")
        print("="*135)
        print("* PBP TRIPS/TDS/FGS = computed directly from play-by-play (drive-level).")
        print("* OFF TRIPS/SCR = official box-score red-zone numbers, shown as a cross-check.")

        fname = f"{p_data['name'].replace(' ', '_')}_redzone_report_{YEAR}.csv"
        df.to_csv(fname, index=False)
        print(f"\n💾 Saved to '{fname}'")
    else:
        print("\n❌ No stats found.")


if __name__ == "__main__":
    run_analysis()
