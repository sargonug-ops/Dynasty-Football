"""Usage Report — combines what used to be two separate scripts:

- target_share.py: Touch Share = touches / ALL team offensive snaps
- adjusted_usage.py: "Situational" Touch Share = touches / snaps EXCLUDING
  obvious-run downs (1st/2nd & <5, 3rd & <=3) - a game-script-neutral
  usage rate

Both are genuinely different, useful metrics, so this script reports both
side by side per game instead of picking one.
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


def _is_touch(name, pos, play):
    p_type = play.get('playType', '')
    if name not in play.get('playText', ''):
        return False, p_type
    is_touch = False
    if "Rush" in p_type or "Reception" in p_type or "Touchdown" in p_type:
        is_touch = True
    if pos == 'QB' and ("Pass" in p_type or "Sack" in p_type):
        is_touch = True
    return is_touch, p_type


def calculate_usage(player_data):
    """Computes BOTH raw touch share (all snaps) and situational/adjusted
    touch share (excluding obvious-run downs) in a single PBP scan."""
    name = player_data['name']
    team = player_data['team']
    pos = player_data['position']
    print(f"📡 Scanning Usage for {name}...", end="\r")

    usage_stats = {}
    url = "https://api.collegefootballdata.com/plays"

    for week in range(1, 16):
        try:
            resp = requests.get(url, headers=HEADERS, params={"year": YEAR, "team": team, "week": week})
            plays = resp.json()

            for play in plays:
                if play.get('offense') != team:
                    continue
                p_type = play.get('playType', '')
                if any(x in p_type for x in ["Punt", "Kickoff", "Field Goal", "Timeout", "End of"]):
                    continue

                g_id = str(play.get('gameId'))
                if g_id not in usage_stats:
                    usage_stats[g_id] = {
                        "team_plays": 0, "player_touches": 0, "yards": 0,
                        "adj_snaps": 0, "adj_touches": 0, "adj_yards": 0,
                    }

                is_touch, _ = _is_touch(name, pos, play)
                yards = play.get('yardsGained', 0)

                # Raw usage: every offensive snap counts.
                usage_stats[g_id]["team_plays"] += 1
                if is_touch:
                    usage_stats[g_id]["player_touches"] += 1
                    usage_stats[g_id]["yards"] += yards

                # Situational (adjusted) usage: exclude obvious-run downs.
                down, dist = play.get('down'), play.get('distance')
                is_obvious_run = False
                if down is not None and dist is not None:
                    if (down in [1, 2] and dist < 5) or (down == 3 and dist <= 3):
                        is_obvious_run = True

                if not is_obvious_run:
                    usage_stats[g_id]["adj_snaps"] += 1
                    if is_touch:
                        usage_stats[g_id]["adj_touches"] += 1
                        usage_stats[g_id]["adj_yards"] += yards

        except Exception:
            pass

    return usage_stats


def run_analysis():
    p_data = search_player(input("\nEnter Player Name: ").strip())
    if not p_data:
        return

    game_map = get_schedule_map(p_data['team'])
    stats = calculate_usage(p_data)

    rows = []
    s_plays = s_touches = s_yards = 0
    s_adj_snaps = s_adj_touches = s_adj_yards = 0

    sorted_games = sorted(game_map.items(), key=lambda x: x[1]['date'])

    for g_id, info in sorted_games:
        data = stats.get(g_id)
        if data and data['team_plays'] > 0:
            t_plays, p_touches, p_yards = data['team_plays'], data['player_touches'], data['yards']
            adj_snaps, adj_touches, adj_yards = data['adj_snaps'], data['adj_touches'], data['adj_yards']

            share_pct = (p_touches / t_plays * 100) if t_plays > 0 else 0.0
            adj_share_pct = (adj_touches / adj_snaps * 100) if adj_snaps > 0 else 0.0

            s_plays += t_plays; s_touches += p_touches; s_yards += p_yards
            s_adj_snaps += adj_snaps; s_adj_touches += adj_touches; s_adj_yards += adj_yards

            rows.append({
                "Date": info['date'],
                "Opponent": info['opponent'],
                "Team_Snaps": t_plays,
                "Touches": p_touches,
                "Touch_Share": f"{share_pct:.1f}%",
                "Yards": p_yards,
                "Adj_Snaps": adj_snaps,
                "Adj_Touch": adj_touches,
                "Adj_Share": f"{adj_share_pct:.1f}%",
                "Adj_Yds": adj_yards,
            })

    if rows:
        df = pd.DataFrame(rows)
        print("\n" + "="*115)
        print(f"📊 USAGE REPORT: {p_data['name'].upper()} ({p_data['position']})")
        print(f"{'DATE':<12} {'OPPONENT':<20} | {'SNAPS':<6} {'TOUCH':<6} {'SHARE':<7} {'YDS':<5} | "
              f"{'ADJ SNP':<7} {'ADJ TCH':<7} {'ADJ SHR':<7} {'ADJ YDS':<7}")
        print("-" * 115)

        for _, r in df.iterrows():
            print(f"{r['Date']:<12} {r['Opponent']:<20} | {r['Team_Snaps']:<6} {r['Touches']:<6} {r['Touch_Share']:<7} "
                  f"{r['Yards']:<5} | {r['Adj_Snaps']:<7} {r['Adj_Touch']:<7} {r['Adj_Share']:<7} {r['Adj_Yds']:<7}")

        print("-" * 115)
        total_share = (s_touches / s_plays * 100) if s_plays > 0 else 0.0
        total_adj_share = (s_adj_touches / s_adj_snaps * 100) if s_adj_snaps > 0 else 0.0
        print(f"{'TOTAL':<34} | {s_plays:<6} {s_touches:<6} {f'{total_share:.1f}%':<7} {s_yards:<5} | "
              f"{s_adj_snaps:<7} {s_adj_touches:<7} {f'{total_adj_share:.1f}%':<7} {s_adj_yards:<7}")
        print("="*115)
        print("* SNAPS = all offensive snaps. ADJ SNP = snaps excluding obvious-run downs")
        print("  (1st/2nd & <5, 3rd & <=3), for a game-script-neutral usage read.")

        fname = f"{p_data['name'].replace(' ', '_')}_usage_report_{YEAR}.csv"
        df.to_csv(fname, index=False)
        print(f"\n💾 Saved to '{fname}'")
    else:
        print("\n❌ No stats found.")


if __name__ == "__main__":
    run_analysis()
