"""Betting Report — combines what used to be two separate scripts:

- betting_data.py: pulled Spread, Over/Under, and Implied Points per game
- adjusted_betting_data.py: pulled Spread and a 1-10 relative difficulty
  Rating (vs. the team's own average spread for the season), with no O/U

This script reports Spread, O/U, Implied Points, AND the Rating together
so nothing gets left out.
"""
import requests
import pandas as pd
import warnings
from dateutil import parser
from config import API_KEY, HEADERS
from defense_intel import calculate_relative_rating

warnings.filterwarnings("ignore", category=UserWarning, module='urllib3')
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
    except Exception:
        return None


def get_betting_data(team_name):
    print(f"📡 Fetching Betting Lines for {team_name}...", end="\r")
    url = "https://api.collegefootballdata.com/lines"
    params = {"year": YEAR, "team": team_name}

    rows = []
    spreads = []

    try:
        resp = requests.get(url, headers=HEADERS, params=params)
        games = resp.json()

        game_data_list = []

        for game in games:
            home = game.get('homeTeam')
            away = game.get('awayTeam')
            opponent = away if home == team_name else home

            lines = game.get('lines', [])
            if not lines:
                continue

            # Priority: Consensus -> DraftKings -> Bovada -> First Available
            selected_line = lines[0]
            providers = {line.get('provider'): line for line in lines}
            if 'consensus' in providers: selected_line = providers['consensus']
            elif 'DraftKings' in providers: selected_line = providers['DraftKings']
            elif 'Bovada' in providers: selected_line = providers['Bovada']

            spread = selected_line.get('spread')
            over_under = selected_line.get('overUnder')
            provider_name = selected_line.get('provider')
            fmt_spread = selected_line.get('formattedSpread', '')

            if spread is None:
                continue

            my_spread = 0.0
            if team_name in fmt_spread:
                try:
                    val_str = fmt_spread.split(team_name)[1].strip().split(' ')[0]
                    my_spread = float(val_str)
                except Exception: my_spread = float(spread)
            else:
                try:
                    val_str = fmt_spread.split(opponent)[1].strip().split(' ')[0]
                    my_spread = -1 * float(val_str)
                except Exception: my_spread = float(spread)

            implied_points = None
            if over_under is not None:
                implied_points = (float(over_under) - my_spread) / 2

            raw_date = game.get('startDate')
            fmt_date = "9999-12-31"
            if raw_date:
                try: fmt_date = parser.parse(raw_date).strftime("%Y-%m-%d")
                except Exception: pass

            spreads.append(my_spread)
            game_data_list.append({
                "date": fmt_date, "opponent": opponent, "provider": provider_name,
                "formatted": fmt_spread, "my_spread": my_spread,
                "over_under": over_under, "implied_points": implied_points,
            })

        if not spreads:
            return [], 0

        avg_spread = sum(spreads) / len(spreads)

        for item in game_data_list:
            rating = calculate_relative_rating(item['my_spread'], avg_spread)
            rows.append({
                "Date": item['date'],
                "Opponent": item['opponent'],
                "Provider": item['provider'],
                "Spread": item['formatted'],
                "Total": item['over_under'] if item['over_under'] is not None else "-",
                "Implied_Pts": f"{item['implied_points']:.1f}" if item['implied_points'] is not None else "-",
                "Rating": rating,
            })

    except Exception:
        pass

    return rows, avg_spread if spreads else 0


def run_analysis():
    team = search_team()
    if not team:
        return

    data, avg_spread = get_betting_data(team)

    if data:
        df = pd.DataFrame(data)
        df = df.sort_values(by='Date')

        print("\n" + "="*115)
        print(f"🎰 BETTING REPORT: {team.upper()}")
        print(f"   Team Baseline Spread: {avg_spread:+.1f} (Average line for {team})")
        print("-" * 115)
        print(f"{'DATE':<12} {'OPPONENT':<18} | {'LINE':<20} {'O/U':<6} {'IMPLIED':<8} | {'RATING':<6} {'CATEGORY'}")
        print("-" * 115)

        for _, r in df.iterrows():
            rating = r['Rating']
            desc = "Easy Win" if rating <= 3 else "Average" if rating <= 6 else "Challenge" if rating <= 8 else "BRUTAL"
            print(f"{r['Date']:<12} {r['Opponent']:<18} | {r['Spread']:<20} {r['Total']:<6} {r['Implied_Pts']:<8} | {rating:<6} {desc}")

        print("="*115)
        print("* IMPLIED PTS: What Vegas expected the team to score.")
        print("* RATING: 1-10 difficulty vs. the team's own average line for the season.")

        fname = f"{team.replace(' ', '_')}_betting_report_{YEAR}.csv"
        df.to_csv(fname, index=False)
        print(f"\n💾 Saved to '{fname}'")
    else:
        print("\n❌ No betting data found.")


if __name__ == "__main__":
    run_analysis()
