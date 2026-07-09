import requests
import pandas as pd
import json
import os
import warnings

# --- CONFIGURATION ---
warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
from config import API_KEY, HEADERS
YEAR = 2025
MIN_YARDS = 200 

# Path: Saves directly to your frontend
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "../frontend/src/prospects.json")

CONFERENCES = ["SEC", "B1G", "ACC", "B12", "Ind"] 

def fetch_directory():
    print(f"\n🏈 --- DYNASTY SCOUT: LITE DIRECTORY ({YEAR}) ---")
    
    # 1. FETCH ROSTERS (To get Name, School, Position)
    print("📋 Mapping Rosters...")
    roster_map = {} 
    url_roster = "https://api.collegefootballdata.com/roster"
    
    for conf in CONFERENCES:
        print(f"   - Scanning {conf}...", end="\r")
        try:
            resp = requests.get(url_roster, headers=HEADERS, params={"year": YEAR, "conference": conf})
            if resp.status_code == 200:
                for p in resp.json():
                    # Only track Skill Positions
                    if p.get('position') in ['QB', 'RB', 'WR', 'TE']:
                        pid = str(p['id'])
                        
                        # FIX: Handle the CamelCase keys we found in debugging
                        f_name = p.get('firstName') or p.get('first_name') or "Unknown"
                        l_name = p.get('lastName') or p.get('last_name') or "Player"
                        
                        roster_map[pid] = {
                            "name": f"{f_name} {l_name}",
                            "school": p.get('team') or p.get('school'),
                            "pos": p.get('position')
                        }
        except: pass

    print(f"\n✅ Rosters Mapped. Found {len(roster_map)} skill players.")
    
    # 2. FETCH SEASON STATS (Fast Bulk Fetch)
    print(f"📊 Fetching Season Stats...")
    all_stats = []
    url_stats = "https://api.collegefootballdata.com/stats/player/season"
    
    for conf in CONFERENCES:
        print(f"   - Downloading {conf} stats...", end="\r")
        try:
            resp = requests.get(url_stats, headers=HEADERS, params={"year": YEAR, "conference": conf})
            if resp.status_code == 200:
                all_stats.extend(resp.json())
        except: pass

    # 3. PROCESS DATA (Using Pandas for speed)
    if all_stats:
        df = pd.DataFrame(all_stats)
        
        # Force ID to string to match roster_map
        df['playerId'] = df['playerId'].astype(str)
        df['stat'] = pd.to_numeric(df['stat'], errors='coerce').fillna(0)
        
        # FILTER: Only Offense (No Kick Returns)
        # We only want: rushing, receiving, passing
        df = df[df['category'].isin(['rushing', 'receiving', 'passing'])]
        
        # AGGREGATE YARDS (Sum up all offensive yards)
        df_yards = df[df['statType'] == 'YDS']
        total_yards = df_yards.groupby('playerId')['stat'].sum().to_dict()
        
        # AGGREGATE TDS
        df_tds = df[df['statType'] == 'TD']
        total_tds = df_tds.groupby('playerId')['stat'].sum().to_dict()
        
        # 4. MERGE ROSTER + STATS
        print("\n🔨 Building Final List...")
        final_prospects = []
        
        for pid, info in roster_map.items():
            yds = int(total_yards.get(pid, 0))
            tds = int(total_tds.get(pid, 0))
            
            # Apply Filter
            if yds >= MIN_YARDS:
                final_prospects.append({
                    "id": pid,
                    "name": info['name'],
                    "school": info['school'],
                    "pos": info['pos'],
                    "trend": "flat",
                    "stats": {
                        "s1": f"{yds:,}",  # Formatted Yards
                        "s2": str(tds),    # TDs
                        "s3": "-"          # Avg (Placeholder)
                    }
                })

        # Sort by Yards (High -> Low)
        final_prospects.sort(key=lambda x: int(x['stats']['s1'].replace(',', '')), reverse=True)
        
        # 5. SAVE
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w") as f:
            json.dump(final_prospects, f, indent=2)
            
        print(f"✅ SUCCESS! Processed {len(final_prospects)} players.")
        print(f"💾 Saved to: {OUTPUT_PATH}")
        
    else:
        print("❌ No stats found. Check API key or Year.")

if __name__ == "__main__":
    fetch_directory()