"""Player Game Log — the definitive per-game stat puller.

Consolidates what used to be several overlapping scripts:
- master_scout.py: box score stats (passing/rushing/receiving, position-aware
  columns) with completion percentage
- master_scout2.py: explosive play counts (runs > 15 yds, catches/throws > 20
  yds), but without completion percentage
- schedule.py / get_season_stats.py / query_schedule.py: hardcoded or
  generalized receiving-only (Rec/Yds/TD) pulls with no unique stats beyond
  what this script already covers

This script keeps every stat all of those produced: box score numbers,
completion %, and explosive play counts, in one place.
"""
import requests
import pandas as pd
import warnings
from dateutil import parser
from config import API_KEY, HEADERS

warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
CURRENT_YEAR = 2025


def search_player(name_query):
    """Finds a player and identifies their POSITION (QB, RB, WR, etc.)."""
    print(f"🔍 Searching for '{name_query}'...", end="\r")
    url = "https://api.collegefootballdata.com/player/search"
    params = {"searchTerm": name_query, "year": CURRENT_YEAR}

    try:
        resp = requests.get(url, headers=HEADERS, params=params)
        results = resp.json()

        if not results:
            print(f"❌ No player found named '{name_query}'.")
            return None

        if len(results) == 1:
            p = results[0]
            print(f"✅ Found: {p['name']} ({p['team']} - {p['position']})")
            return p

        print(f"\n⚠️ Multiple players found:")
        for i, p in enumerate(results):
            print(f"   {i+1}. {p['name']} -- {p['team']} ({p['position']})")

        choice = input(f"Select # (1-{len(results)}): ")
        try:
            return results[int(choice) - 1]
        except Exception:
            return None
    except Exception as e:
        print(f"❌ Search Error: {e}")
        return None


def get_schedule_map(team_name):
    """Builds the Date/Opponent map for the specific team."""
    print(f"📅 Fetching Schedule for {team_name}...", end="\r")
    schedule_map = {}
    url = "https://api.collegefootballdata.com/games"

    for season_type in ['regular', 'postseason']:
        params = {"year": CURRENT_YEAR, "team": team_name, "seasonType": season_type}
        try:
            resp = requests.get(url, headers=HEADERS, params=params)
            for game in resp.json():
                g_id = str(game.get('id'))

                raw_date = game.get('startDate')
                fmt_date = "9999-12-31"
                if raw_date:
                    try:
                        fmt_date = parser.parse(raw_date).strftime("%Y-%m-%d")
                    except Exception:
                        pass

                home, away = game.get('homeTeam'), game.get('awayTeam')
                opponent = away if home == team_name else home
                if opponent is None:
                    opponent = "TBD"

                schedule_map[g_id] = {"date": fmt_date, "opponent": opponent, "week": game.get('week', 0)}
        except Exception:
            pass
    return schedule_map


def get_explosive_plays(player_name, team_name):
    """Scans play-by-play for explosive runs (>15 yds) and passes/catches (>20 yds)."""
    print(f"💥 Scanning for Explosive Plays...", end="\r")
    explosive_stats = {}
    url = "https://api.collegefootballdata.com/plays"

    tasks = [
        {"seasonType": "regular", "weeks": range(1, 16)},
        {"seasonType": "postseason", "weeks": [1]},
    ]

    for task in tasks:
        sType = task['seasonType']
        loop_iter = task['weeks'] if sType == 'regular' else [1]

        for week in loop_iter:
            try:
                params = {"year": CURRENT_YEAR, "team": team_name, "seasonType": sType}
                if sType == 'regular':
                    params['week'] = week

                resp = requests.get(url, headers=HEADERS, params=params)
                plays = resp.json()

                for play in plays:
                    g_id = str(play.get('gameId'))
                    if g_id not in explosive_stats:
                        explosive_stats[g_id] = {'ExpRun': 0, 'ExpPass': 0}

                    if player_name in play.get('playText', ''):
                        p_type = play.get('playType', '')
                        yards = play.get('yardsGained', 0)

                        if "Rush" in p_type and yards > 15:
                            explosive_stats[g_id]['ExpRun'] += 1

                        if ("Reception" in p_type or "Pass" in p_type or "Touchdown" in p_type) and yards > 20:
                            explosive_stats[g_id]['ExpPass'] += 1
            except Exception:
                pass

    return explosive_stats


def get_stats_profile(position):
    """Decides which columns to show based on position."""
    if position == 'QB':
        return {
            'cols': ['Date', 'Wk', 'Opp', 'C/ATT', 'Pct', 'PasYds', 'PasTD', 'Int', 'ExpPass',
                     'Car', 'RusYds', 'RusTD', 'ExpRun']
        }
    else:
        return {
            'cols': ['Date', 'Wk', 'Opp', 'Car', 'RusYds', 'RusTD', 'ExpRun',
                     'Rec', 'RecYds', 'RecTD', 'ExpRec']
        }


def get_player_game_stats(player_data):
    name = player_data['name']
    team = player_data['team']
    pos = player_data['position']

    game_map = get_schedule_map(team)
    explosive_data = get_explosive_plays(name, team)
    profile = get_stats_profile(pos)
    print(f"\n🏈 --- PLAYER GAME LOG: {name.upper()} ({pos}) ---")

    url = "https://api.collegefootballdata.com/games/players"
    all_rows = []

    for season_type in ['regular', 'postseason']:
        params = {"year": CURRENT_YEAR, "team": team, "seasonType": season_type}

        try:
            resp = requests.get(url, headers=HEADERS, params=params)
            games_data = resp.json()

            for game in games_data:
                game_id = str(game.get('id'))
                info = game_map.get(game_id, {'date': 'Unknown', 'opponent': 'Unknown', 'week': 0})
                exp_stats = explosive_data.get(game_id, {'ExpRun': 0, 'ExpPass': 0})

                stats = {
                    'Date': info['date'], 'Wk': info['week'], 'Opp': info['opponent'],
                    'C/ATT': '0/0', 'Pct': '0.0', 'PasYds': 0, 'PasTD': 0, 'Int': 0,
                    'Car': 0, 'RusYds': 0, 'RusTD': 0,
                    'Rec': 0, 'RecYds': 0, 'RecTD': 0,
                    'ExpRun': exp_stats['ExpRun'],
                    'ExpPass': exp_stats['ExpPass'],  # QB label
                    'ExpRec': exp_stats['ExpPass'],   # WR/TE/RB label (same data source)
                }

                player_found = False

                for t in game.get('teams', []):
                    t_name = t.get('school') or t.get('team')
                    if t_name != team:
                        continue

                    for cat in t.get('categories', []):
                        cat_name = cat.get('name')  # passing, rushing, receiving

                        for stat_type in cat.get('types', []):
                            s_label = stat_type.get('name')

                            for ath in stat_type.get('athletes', []):
                                if ath.get('name') != name:
                                    continue

                                player_found = True
                                val_str = ath.get('stat', '0')

                                if cat_name == 'passing':
                                    if s_label == 'C/ATT':
                                        stats['C/ATT'] = val_str
                                        try:
                                            c, a = map(int, val_str.split('/'))
                                            stats['Pct'] = f"{(c/a)*100:.1f}" if a > 0 else "0.0"
                                        except Exception:
                                            pass
                                    elif s_label == 'YDS': stats['PasYds'] = int(val_str)
                                    elif s_label == 'TD': stats['PasTD'] = int(val_str)
                                    elif s_label == 'INT': stats['Int'] = int(val_str)

                                elif cat_name == 'rushing':
                                    if s_label == 'CAR': stats['Car'] = int(val_str)
                                    elif s_label == 'YDS': stats['RusYds'] = int(val_str)
                                    elif s_label == 'TD': stats['RusTD'] = int(val_str)

                                elif cat_name == 'receiving':
                                    if s_label == 'REC': stats['Rec'] = int(val_str)
                                    elif s_label == 'YDS': stats['RecYds'] = int(val_str)
                                    elif s_label == 'TD': stats['RecTD'] = int(val_str)

                if player_found:
                    row_data = {k: stats[k] for k in profile['cols']}
                    all_rows.append(row_data)

        except Exception as e:
            print(f"❌ Error parsing game: {e}")

    if all_rows:
        df = pd.DataFrame(all_rows)
        df = df.sort_values(by=['Date'])

        cols = profile['cols']
        header_str = ""
        for c in cols:
            if c == 'Date': header_str += f"{c:<12}  "
            elif c == 'Opp': header_str += f"{c:<20}  "
            else: header_str += f"{c:<8}  "

        print("\n" + "="*len(header_str))
        print(header_str)
        print("-" * len(header_str))

        for _, row in df.iterrows():
            row_str = ""
            for c in cols:
                val = str(row[c])
                if c == 'Date': row_str += f"{val:<12}  "
                elif c == 'Opp': row_str += f"{val:<20}  "
                else: row_str += f"{val:<8}  "
            print(row_str)

        print("="*len(header_str))
        if pos == 'QB':
            print("* ExpPass = Throws > 20 yards  |  ExpRun = Runs > 15 yards")
        else:
            print("* ExpRec = Catches > 20 yards  |  ExpRun = Runs > 15 yards")

        fname = f"{name.replace(' ', '_')}_{pos}_game_log_{CURRENT_YEAR}.csv"
        df.to_csv(fname, index=False)
        print(f"\n💾 Saved to '{fname}'")
    else:
        print(f"❌ No stats found for {name}.")


if __name__ == "__main__":
    while True:
        print("\n" + "="*40)
        q = input("Enter Player Name (or 'q'): ").strip()
        if q.lower() == 'q':
            break

        p_data = search_player(q)
        if p_data:
            get_player_game_stats(p_data)
