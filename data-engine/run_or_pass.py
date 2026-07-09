import requests
import pandas as pd
import warnings
from dateutil import parser

# 1. SETUP
warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
from config import API_KEY, HEADERS
YEAR = 2025

def search_team():
    q = input("\nEnter Team Name (e.g. Ohio State): ").strip()
    print(f"🔍 Searching for '{q}'...", end="\r")
    url = "https://api.collegefootballdata.com/teams"
    try:
        resp = requests.get(url, headers=HEADERS)
        teams = resp.json()
        matches = [t for t in teams if q.lower() in t['school'].lower()]
        if not matches: return None
        if len(matches) == 1: return matches[0]['school']
        print(f"\n⚠️ Multiple teams found:")
        for i, t in enumerate(matches[:5]):
            print(f"   {i+1}. {t['school']}")
        choice = input(f"Select # (1-{len(matches[:5])}): ")
        return matches[int(choice)-1]['school']
    except: return None

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
                    except: pass
                
                home, away = game.get('homeTeam'), game.get('awayTeam')
                opp = away if home == team_name else home
                schedule_map[g_id] = { "date": fmt_date, "opponent": opp or "TBD" }
        except: pass
    return schedule_map

def analyze_weekly_tendencies(team_name):
    print(f"📡 Scanning Weekly Tendencies for {team_name}...", end="\r")
    game_stats = {}
    url = "https://api.collegefootballdata.com/plays"
    
    for week in range(1, 16):
        try:
            resp = requests.get(url, headers=HEADERS, params={"year": YEAR, "team": team_name, "week": week})
            plays = resp.json()
            
            for play in plays:
                if play.get('offense') != team_name: continue
                p_type = play.get('playType', '')
                if any(x in p_type for x in ["Punt", "Kickoff", "Field Goal", "Timeout", "End of"]): continue
                
                g_id = str(play.get('gameId'))
                if g_id not in game_stats:
                    # Added 'total_dist' to accumulator
                    game_stats[g_id] = {
                        "total": 0,
                        "scenarios": {
                            "Obvious Pass": {"count": 0, "run": 0, "pass": 0, "dist_sum": 0},
                            "Obvious Run":  {"count": 0, "run": 0, "pass": 0, "dist_sum": 0},
                            "Ambiguous":    {"count": 0, "run": 0, "pass": 0, "dist_sum": 0}
                        }
                    }

                down = play.get('down')
                dist = play.get('distance')
                if down is None or dist is None or down == 0: continue
                
                game_stats[g_id]["total"] += 1
                
                category = "Ambiguous"
                if (down in [1, 2] and dist >= 12) or (down == 3 and dist >= 5):
                    category = "Obvious Pass"
                elif (down in [1, 2] and dist < 5) or (down == 3 and dist <= 3):
                    category = "Obvious Run"
                
                is_run = "Rush" in p_type
                is_pass = "Pass" in p_type or "Sack" in p_type or "Interception" in p_type
                
                stats = game_stats[g_id]["scenarios"][category]
                stats["count"] += 1
                stats["dist_sum"] += dist # Accumulate distance
                
                if is_run: stats["run"] += 1
                if is_pass: stats["pass"] += 1
        except: pass
    return game_stats

def run_analysis():
    team = search_team()
    if not team: return

    game_map = get_schedule_map(team)
    game_stats = analyze_weekly_tendencies(team)
    
    rows = []
    sorted_games = sorted(game_map.items(), key=lambda x: x[1]['date'])
    
    for g_id, info in sorted_games:
        stats = game_stats.get(g_id)
        if stats and stats['total'] > 0:
            for cat, data in stats['scenarios'].items():
                count = data['count']
                if count > 0:
                    valid = data['run'] + data['pass']
                    run_pct = (data['run'] / valid * 100) if valid > 0 else 0.0
                    pass_pct = (data['pass'] / valid * 100) if valid > 0 else 0.0
                    
                    # Calculate Average Distance
                    avg_dist = data['dist_sum'] / count
                    
                    rows.append({
                        "Date": info['date'],
                        "Opponent": info['opponent'],
                        "Scenario": cat,
                        "Count": count,
                        "Avg_Dist": f"{avg_dist:.1f}",
                        "Run_%": f"{run_pct:.0f}%",
                        "Pass_%": f"{pass_pct:.0f}%"
                    })

    if rows:
        df = pd.DataFrame(rows)
        print("\n" + "="*105) # Widened header line
        print(f"🧠 WEEKLY TENDENCY REPORT: {team.upper()}")
        print(f"{'DATE':<12} {'OPPONENT':<22} | {'SCENARIO':<18} {'PLAYS':<6} {'AVG DIST':<9} | {'RUN %':<8} {'PASS %':<8}")
        print("=" * 105)
        
        last_date = ""
        
        for _, r in df.iterrows():
            if last_date and r['Date'] != last_date:
                print("-" * 105)
            
            if r['Date'] != last_date:
                date_str = r['Date']
                opp_str = r['Opponent']
            else:
                date_str = ""
                opp_str = ""
            
            print(f"{date_str:<12} {opp_str:<22} | {r['Scenario']:<18} {r['Count']:<6} {r['Avg_Dist']:<9} | {r['Run_%']:<8} {r['Pass_%']:<8}")
            
            last_date = r['Date']
            
        print("="*105)
        fname = f"{team.replace(' ', '_')}_weekly_tendencies_2024.csv"
        df.to_csv(fname, index=False)
        print(f"\n💾 Saved to '{fname}'")
    else:
        print("\n❌ No plays found.")

if __name__ == "__main__":
    run_analysis()