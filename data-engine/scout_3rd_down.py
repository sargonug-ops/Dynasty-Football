import requests
import pandas as pd
import warnings
from dateutil import parser

# 1. SETUP
warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
from config import API_KEY, HEADERS
YEAR = 2025

def search_player(name_query):
    """
    Interactively searches for a player to get exact Name and Team.
    """
    print(f"🔍 Searching for '{name_query}'...", end="\r")
    url = "https://api.collegefootballdata.com/player/search"
    params = { "searchTerm": name_query, "year": YEAR }
    
    try:
        resp = requests.get(url, headers=HEADERS, params=params)
        results = resp.json()
        
        if not results:
            print(f"❌ No player found named '{name_query}'.")
            return None

        # Auto-select if only 1 result
        if len(results) == 1:
            p = results[0]
            print(f"✅ Found: {p['name']} ({p['team']} - {p['position']})")
            return p
            
        # User Selection for multiple matches
        print(f"\n⚠️ Multiple players found for '{name_query}':")
        for i, p in enumerate(results):
            print(f"   {i+1}. {p['name']} -- {p['team']} ({p['position']})")
        
        choice = input(f"Select Player # (1-{len(results)}): ")
        try:
            return results[int(choice) - 1]
        except:
            print("❌ Invalid selection.")
            return None
    except Exception as e:
        print(f"❌ Search Error: {e}")
        return None

def get_official_team_stats(team_name):
    """
    Fetches the OFFICIAL box score stats (The Answer Key).
    """
    print(f"📊 Fetching Official Team Stats for {team_name}...", end="\r")
    official_data = {}
    
    url = "https://api.collegefootballdata.com/games/teams"
    params = { "year": YEAR, "team": team_name }
    
    try:
        resp = requests.get(url, headers=HEADERS, params=params)
        games = resp.json()
        
        for game in games:
            g_id = str(game.get('id'))
            
            for team in game.get('teams', []):
                # Robust Team Name Check
                t_name = team.get('school') or team.get('team') or team.get('schoolName')
                
                if t_name == team_name:
                    for stat in team.get('stats', []):
                        if stat.get('category') == 'thirdDownEff':
                            # Format: "5-15" (Made-Att)
                            val = stat.get('stat')
                            try:
                                made, att = map(int, val.split('-'))
                                official_data[g_id] = { "team_att": att, "team_conv": made }
                            except: pass
    except: pass
        
    return official_data

def get_schedule_map(team_name):
    schedule_map = {}
    url = "https://api.collegefootballdata.com/games"
    for season_type in ['regular', 'postseason']:
        try:
            resp = requests.get(url, headers=HEADERS, params={"year": YEAR, "team": team_name, "seasonType": season_type})
            for game in resp.json():
                g_id = str(game.get('id'))
                # Parse Date
                raw_date = game.get('startDate')
                fmt_date = "9999-12-31"
                if raw_date:
                    try:
                        fmt_date = parser.parse(raw_date).strftime("%Y-%m-%d")
                    except: pass
                # Parse Opponent
                home, away = game.get('homeTeam'), game.get('awayTeam')
                opponent = away if home == team_name else home
                if opponent is None: opponent = "TBD"
                
                schedule_map[g_id] = { "date": fmt_date, "opponent": opponent, "week": game.get('week', 0) }
        except: pass
    return schedule_map

def run_analysis(player_data):
    target_player = player_data['name']
    target_team = player_data['team']
    
    # 1. Get Official Data
    team_stats = get_official_team_stats(target_team)
    game_map = get_schedule_map(target_team)
    
    if not team_stats:
        print(f"❌ Could not load official stats for {target_team}. (Check API key or Team Name)")
        return

    # 2. Get Player Play-by-Play Data
    print(f"📡 Scanning Play-by-Play for {target_player}...", end="\r")
    player_stats = {}
    
    url = "https://api.collegefootballdata.com/plays"
    # Scan weeks 1-16
    for week in range(1, 16):
        try:
            resp = requests.get(url, headers=HEADERS, params={"year": YEAR, "team": target_team, "week": week})
            plays = resp.json()
            
            for play in plays:
                # Filter: 3rd Down
                if play.get('down') != 3: continue
                
                # Filter: Pass Plays Only (camelCase keys)
                p_type = play.get('playType', '')
                if 'Pass' not in p_type and 'Interception' not in p_type: continue
                
                # Filter: Specific Player involved
                if target_player not in play.get('playText', ''): continue
                
                g_id = str(play.get('gameId'))
                if g_id not in player_stats:
                    player_stats[g_id] = { "att": 0, "comp": 0 }
                
                player_stats[g_id]['att'] += 1
                
                # Completion Logic
                is_comp = False
                if "Reception" in p_type: is_comp = True
                elif "Touchdown" in p_type and "Interception" not in p_type: is_comp = True
                
                if is_comp: player_stats[g_id]['comp'] += 1
        except: pass

    # 3. Merge & Display
    final_rows = []
    
    for g_id, official in team_stats.items():
        info = game_map.get(g_id, {'date': 'Unknown', 'opponent': 'Unknown', 'week': 0})
        
        # Team Official Stats
        t_att = official['team_att']
        t_conv = official['team_conv']
        t_pct = (t_conv / t_att * 100) if t_att > 0 else 0.0
        
        # Player Stats (calculated from PBP)
        p_data = player_stats.get(g_id, {'att': 0, 'comp': 0})
        p_att = p_data['att']
        p_comp = p_data['comp']
        p_pct = (p_comp / p_att * 100) if p_att > 0 else 0.0
        
        final_rows.append({
            "Date": info['date'],
            "Opponent": info['opponent'],
            "Team_Att": t_att,
            "Team_Conv": t_conv,
            "Team_Pct": f"{t_pct:.0f}%",
            "Pl_Att": p_att,
            "Pl_Comp": p_comp,
            "Pl_Pct": f"{p_pct:.0f}%"
        })
        
    if final_rows:
        df = pd.DataFrame(final_rows).sort_values(by='Date')
        
        print("\n" + "="*95)
        print(f"🏈 3RD DOWN PASSING: {target_player.upper()} vs {target_team.upper()} TOTALS")
        print(f"{'DATE':<12} {'OPPONENT':<20} | {'TEAM (OFFICIAL)':<18} | {'PLAYER (PBP)':<18}")
        print(f"{'':<34} | {'ATT':<4} {'CNV':<4} {'%':<5}    | {'ATT':<4} {'CMP':<4} {'%':<5}")
        print("-" * 95)
        
        for _, r in df.iterrows():
            print(f"{r['Date']:<12} {r['Opponent']:<20} | {r['Team_Att']:<4} {r['Team_Conv']:<4} {r['Team_Pct']:<5}    | {r['Pl_Att']:<4} {r['Pl_Comp']:<4} {r['Pl_Pct']:<5}")
            
        print("="*95)
        
        safe_name = target_player.replace(" ", "_")
        fname = f"{safe_name}_3rd_down_2024.csv"
        df.to_csv(fname, index=False)
        print(f"\n💾 Saved to '{fname}'")
    else:
        print("\n❌ No stats found.")

# --- MAIN LOOP ---
if __name__ == "__main__":
    while True:
        print("\n" + "="*40)
        q = input("Enter Player Name (or 'q' to quit): ").strip()
        if q.lower() == 'q': break
        
        player_info = search_player(q)
        if player_info:
            run_analysis(player_info)