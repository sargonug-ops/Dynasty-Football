import sys
import warnings
import psycopg2
from psycopg2.extras import execute_values

# 1. SETUP & CONFIGURATION
warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
from config import API_KEY, HEADERS
from defense_intel import prefetch_defensive_intel, get_havoc_rating, OPPONENT_INTEL
from db_config import DB_CONFIG
YEAR = 2025

def update_database():
    """
    Takes the raw data from OPPONENT_INTEL, calculates the Havoc Scores,
    and saves them into your PostgreSQL database.
    """
    print(f"💾 Saving intel to the Database...", end="\r")
    
    try:
        # 1. Connect to Database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        rows_to_insert = []
        
        # 2. Calculate Stats for Every Team (shared formula, see defense_intel.py)
        for team in OPPONENT_INTEL:
            if OPPONENT_INTEL[team]['games'] == 0: continue
            havoc_score, sacks_pg, turnovers_pg = get_havoc_rating(team)
            rows_to_insert.append((team, havoc_score, sacks_pg, turnovers_pg))

        # 3. SQL Query (The "Upsert")
        # "ON CONFLICT (team_name) DO UPDATE" means:
        # If the team exists, update their stats. If not, insert them.
        query = """
            INSERT INTO defensive_intel (team_name, havoc_score, sacks_pg, turnovers_pg)
            VALUES %s
            ON CONFLICT (team_name) DO UPDATE 
            SET havoc_score = EXCLUDED.havoc_score,
                sacks_pg = EXCLUDED.sacks_pg,
                turnovers_pg = EXCLUDED.turnovers_pg,
                updated_at = CURRENT_TIMESTAMP;
        """
        
        execute_values(cursor, query, rows_to_insert)
        conn.commit()
        
        cursor.close()
        conn.close()
        print(f"✅ Successfully saved {len(rows_to_insert)} teams to the Database!")
        
    except Exception as e:
        print(f"\n❌ Database Error: {e}")

if __name__ == "__main__":
    year = int(sys.argv[1]) if len(sys.argv) > 1 else YEAR

    # 1. Fetch the stats from the internet
    prefetch_defensive_intel(year)

    # 2. Save them to your database table
    update_database()