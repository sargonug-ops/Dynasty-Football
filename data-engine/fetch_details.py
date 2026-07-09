import requests
import json
import os
import warnings
from dateutil import parser

# --- CONFIGURATION ---
warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
from config import API_KEY, HEADERS
YEAR = 2025

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(SCRIPT_DIR, "../frontend/src/prospects.json")

def get_schedule_map(team_name):
    """ Maps Game ID -> { Date, Opponent, Week } """
    schedule_map = {}
    url = "https://api.collegefootballdata.com/games"
    for s_type in ['regular', 'postseason']:
        try:
            resp = requests.get(url, headers=HEADERS, params={"year": YEAR, "team": team_name, "seasonType": s_type})
            if resp.status_code == 200:
                for game in resp.json():
                    g_id = str(game.get('id'))
                    raw_date = game.get('startDate')
                    fmt_date = "TBD"
                    if raw_date:
                        try: fmt_date = parser.parse(raw_date).strftime("%Y-%m-%d")
                        except: pass
                    
                    home, away = game.get('homeTeam'), game.get('awayTeam')
                    opponent = away if home == team_name else home
                    schedule_map[g_id] = { "date": fmt_date, "opponent": opponent or "TBD", "week": game.get('week', 0) }
        except: pass
    return schedule_map

def fetch_details():
    print(f"\n🚜 --- DYNASTY SCOUT: FINAL DETAIL ENGINE ({YEAR}) ---")
    
    if not os.path.exists(JSON_PATH):
        print("❌ Error: prospects.json not found. Run fetch_directory.py first.")
        return

    with open(JSON_PATH, "r") as f:
        prospects = json.load(f)

    print(f"📂 Loaded {len(prospects)} prospects. Organizing by team...")

    # Group Prospects by Team
    team_roster = {}
    for p in prospects:
        team = p['school']
        if team not in team_roster: team_roster[team] = []
        team_roster[team].append(p)

    sorted_teams = sorted(team_roster.keys())
    total_api_calls = 0
    
    # --- MAIN LOOP ---
    for i, team in enumerate(sorted_teams):
        print(f"   [{i+1}/{len(sorted_teams)}] Scanning: {team}...", end="\r")
        
        # 1. VITALS (Height/Weight)
        try:
            resp = requests.get("https://api.collegefootballdata.com/roster", headers=HEADERS, params={"year": YEAR, "team": team})
            total_api_calls += 1
            if resp.status_code == 200:
                for p_data in resp.json():
                    pid = str(p_data['id'])
                    # Find matching prospect
                    for prospect in team_roster[team]:
                        if prospect['id'] == pid:
                            prospect['height'] = p_data.get('height', 'N/A')
                            prospect['weight'] = str(p_data.get('weight', 'N/A')) + " lbs"
                            prospect['year'] = p_data.get('year', 'N/A')
        except: pass

        # 2. SCHEDULE MAPPING
        schedule = get_schedule_map(team)
        total_api_calls += 2

        # 3. GAME LOGS
        url_games = "https://api.collegefootballdata.com/games/players"
        
        for s_type in ['regular', 'postseason']:
            try:
                params = { "year": YEAR, "team": team, "seasonType": s_type }
                resp = requests.get(url_games, headers=HEADERS, params=params)
                total_api_calls += 1
                
                if resp.status_code == 200:
                    games_data = resp.json()
                    
                    for game in games_data:
                        game_id = str(game.get('id'))
                        info = schedule.get(game_id, {'date': 'Unknown', 'opponent': 'Unknown', 'week': 0})
                        
                        # Process stats for this game
                        for t_obj in game.get('teams', []):
                            # FIX: Check BOTH 'school' and 'team' keys to avoid crashes
                            t_name = t_obj.get('school') or t_obj.get('team')
                            
                            if t_name == team:
                                # We have the team, let's grab all stats for our players
                                for cat in t_obj.get('categories', []):
                                    cat_name = cat.get('name') 
                                    
                                    for stat_type in cat.get('types', []):
                                        s_label = stat_type.get('name')
                                        
                                        for ath in stat_type.get('athletes', []):
                                            pid = str(ath.get('id'))
                                            val = ath.get('stat', '0')
                                            
                                            # Match to prospect
                                            for prospect in team_roster[team]:
                                                if prospect['id'] == pid:
                                                    # Init Log List
                                                    if 'game_log' not in prospect: prospect['game_log'] = []
                                                    
                                                    # Find or Create Log Entry
                                                    log = next((l for l in prospect['game_log'] if l['game_id'] == game_id), None)
                                                    if not log:
                                                        log = {
                                                            "game_id": game_id,
                                                            "week": info['week'],
                                                            "date": info['date'],
                                                            "opponent": info['opponent'],
                                                            "C/ATT": "0/0", "PasYds": 0, "PasTD": 0, "Int": 0,
                                                            "Car": 0, "RusYds": 0, "RusTD": 0,
                                                            "Rec": 0, "RecYds": 0, "RecTD": 0,
                                                            "total_yards": 0
                                                        }
                                                        prospect['game_log'].append(log)
                                                    
                                                    # Assign Data safely
                                                    if cat_name == 'passing':
                                                        if s_label == 'C/ATT': log['C/ATT'] = val
                                                        elif s_label == 'YDS': 
                                                            log['PasYds'] = int(val)
                                                            log['total_yards'] += int(val)
                                                        elif s_label == 'TD': log['PasTD'] = int(val)
                                                        elif s_label == 'INT': log['Int'] = int(val)
                                                    
                                                    elif cat_name == 'rushing':
                                                        if s_label == 'CAR': log['Car'] = int(val)
                                                        elif s_label == 'YDS': 
                                                            log['RusYds'] = int(val)
                                                            log['total_yards'] += int(val)
                                                        elif s_label == 'TD': log['RusTD'] = int(val)
                                                    
                                                    elif cat_name == 'receiving':
                                                        if s_label == 'REC': log['Rec'] = int(val)
                                                        elif s_label == 'YDS': 
                                                            log['RecYds'] = int(val)
                                                            log['total_yards'] += int(val)
                                                        elif s_label == 'TD': log['RecTD'] = int(val)

            except: pass

    # --- FINAL CLEANUP ---
    for p in prospects:
        if 'game_log' in p:
            p['game_log'].sort(key=lambda x: x['week'])
        else:
            p['game_log'] = []

    with open(JSON_PATH, "w") as f:
        json.dump(prospects, f, indent=2)

    print(f"\n\n✅ SUCCESS! Updated {len(prospects)} players.")
    print(f"📉 Total API Calls: ~{total_api_calls}")

if __name__ == "__main__":
    fetch_details()