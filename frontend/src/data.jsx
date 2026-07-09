// src/data.js

// 1. IMPORT REAL DATA FROM PYTHON SCRIPT
// (Ensure this path is correct based on your folder structure)
import databaseData from './prospects.json'; 

// 2. EXPORT IT FOR THE PLAYERS DASHBOARD
export const PLAYER_DATABASE = databaseData;

// --- CONFERENCE DATA ---
// Team metadata only: display name, brand color, and (where the display
// name is an abbreviation) the canonical school name CollegeFootballData
// uses, so live defensive stats fetched from the API can be matched to the
// right team. Actual havoc/sacks/turnover numbers are NOT hardcoded here -
// RankingsDashboard fetches those live from /defenses and merges them in.
export const conferenceData = [
  {
    name: "SEC",
    teams: [
      { name: "Georgia", color: "#BA0C2F" },
      { name: "Texas", color: "#BF5700" },
      { name: "Alabama", color: "#9E1B32" },
      { name: "Ole Miss", color: "#14213D" },
      { name: "Tennessee", color: "#FF8200" },
      { name: "LSU", color: "#461D7C" },
      { name: "Missouri", color: "#F1B82D", darkText: true },
      { name: "Oklahoma", color: "#841617" },
      { name: "Texas A&M", color: "#500000" },
      { name: "Auburn", color: "#0C2340" },
      { name: "Kentucky", color: "#0033A0" },
      { name: "Florida", color: "#FA4616" },
      { name: "S. Carolina", color: "#73000A", cfbdName: "South Carolina" },
      { name: "Arkansas", color: "#9D2235" },
      { name: "Miss State", color: "#660000", cfbdName: "Mississippi State" },
      { name: "Vanderbilt", color: "#866D4B", darkText: true },
    ]
  },
  {
    name: "Big Ten",
    teams: [
      { name: "Ohio State", color: "#BB0000" },
      { name: "Michigan", color: "#00274C" },
      { name: "Oregon", color: "#154733" },
      { name: "Penn State", color: "#041E42" },
      { name: "Iowa", color: "#FFCD00", darkText: true },
      { name: "Wisconsin", color: "#C5050C" },
      { name: "USC", color: "#990000" },
      { name: "Washington", color: "#4B2E83" },
      { name: "UCLA", color: "#2D68C4" },
      { name: "Nebraska", color: "#E41C38" },
      { name: "Michigan St", color: "#18453B", cfbdName: "Michigan State" },
      { name: "Minnesota", color: "#7A0019" },
      { name: "Maryland", color: "#E03A3E" },
      { name: "Illinois", color: "#E84A27" },
      { name: "Rutgers", color: "#D21034" },
      { name: "Purdue", color: "#CEB888", darkText: true },
      { name: "Northwestern", color: "#4E2A84" },
      { name: "Indiana", color: "#990000" },
    ]
  },
  {
    name: "ACC",
    teams: [
      { name: "Miami", color: "#F47321" },
      { name: "Clemson", color: "#F56600" },
      { name: "SMU", color: "#354CA1" },
      { name: "Florida St", color: "#782F40", cfbdName: "Florida State" },
      { name: "Louisville", color: "#C9001F" },
      { name: "NC State", color: "#CC0000" },
      { name: "N. Carolina", color: "#7BAFD4", cfbdName: "North Carolina", darkText: true },
      { name: "Va Tech", color: "#630031", cfbdName: "Virginia Tech" },
      { name: "Duke", color: "#003087" },
      { name: "Pittsburgh", color: "#003594" },
      { name: "California", color: "#003262" },
      { name: "Ga Tech", color: "#B3A369", cfbdName: "Georgia Tech", darkText: true },
      { name: "Syracuse", color: "#D44500" },
      { name: "Wake Forest", color: "#9E7E38", darkText: true },
      { name: "Virginia", color: "#232D4B" },
      { name: "Boston Col", color: "#98002E", cfbdName: "Boston College" },
      { name: "Stanford", color: "#8C1515" },
    ]
  },
  {
    name: "Big 12",
    teams: [
      { name: "Utah", color: "#CC0000" },
      { name: "Kansas St", color: "#512888", cfbdName: "Kansas State" },
      { name: "Oklahoma St", color: "#FF7300", cfbdName: "Oklahoma State" },
      { name: "Iowa State", color: "#C8102E" },
      { name: "Arizona", color: "#CC0033" },
      { name: "West Virginia", color: "#002855" },
      { name: "Texas Tech", color: "#CC0000" },
      { name: "Kansas", color: "#0051BA" },
      { name: "BYU", color: "#002E62" },
      { name: "UCF", color: "#BA9B37", darkText: true },
      { name: "TCU", color: "#4D1979" },
      { name: "Colorado", color: "#000000" },
      { name: "Baylor", color: "#154734" },
      { name: "Cincinnati", color: "#E00122" },
      { name: "Houston", color: "#C8102E" },
      { name: "Arizona St", color: "#8C1D40", cfbdName: "Arizona State" },
    ]
  },
  {
    name: "American",
    teams: [
      { name: "Navy", color: "#00205B" },
      { name: "Tulane", color: "#006747" },
      { name: "Army", color: "#D4BF80", darkText: true },
      { name: "Memphis", color: "#003087" },
      { name: "UTSA", color: "#F15A22" },
      { name: "S. Florida", color: "#006747", cfbdName: "South Florida" },
      { name: "E. Carolina", color: "#592A8A", cfbdName: "East Carolina" },
      { name: "Fla Atlantic", color: "#003366", cfbdName: "Florida Atlantic" },
      { name: "Rice", color: "#00205B" },
      { name: "UAB", color: "#006341" },
      { name: "North Texas", color: "#00853E" },
      { name: "Tulsa", color: "#002D72" },
      { name: "Charlotte", color: "#00703C" },
      { name: "Temple", color: "#9D2235" },
    ]
  },
  {
    name: "Mountain West",
    teams: [
      { name: "Boise State", color: "#0033A0" },
      { name: "UNLV", color: "#CF0A2C" },
      { name: "Fresno State", color: "#C41230" },
      { name: "Air Force", color: "#003087" },
      { name: "Wyoming", color: "#FFC425", darkText: true },
      { name: "San Jose St", color: "#0055A2", cfbdName: "San José State" },
      { name: "Colorado St", color: "#1E4D2B", cfbdName: "Colorado State" },
      { name: "San Diego St", color: "#A6192E", cfbdName: "San Diego State" },
      { name: "Utah State", color: "#0F2439" },
      { name: "Hawaii", color: "#024731", cfbdName: "Hawai'i" },
      { name: "New Mexico", color: "#CE0037" },
      { name: "Nevada", color: "#002E62" },
    ]
  },
  {
    name: "MAC",
    teams: [
      { name: "W. Michigan", color: "#532E1F", cfbdName: "Western Michigan" },
      { name: "Toledo", color: "#003E7E" },
      { name: "Miami (OH)", color: "#B61E2E" },
      { name: "Ohio", color: "#00694E" },
      { name: "Bowling Green", color: "#FE5000", darkText: true },
      { name: "N. Illinois", color: "#BA0C2F", cfbdName: "Northern Illinois" },
      { name: "Buffalo", color: "#005BBB" },
      { name: "C. Michigan", color: "#6A0032", cfbdName: "Central Michigan" },
      { name: "E. Michigan", color: "#006533", cfbdName: "Eastern Michigan" },
      { name: "Ball State", color: "#BA0C2F" },
      { name: "Akron", color: "#041E42" },
      { name: "Kent State", color: "#00244E" },
      { name: "UMass", color: "#881C1C" },
    ]
  },
  {
    name: "Independents",
    teams: [
      { name: "Notre Dame", color: "#C99700", darkText: true },
      { name: "Liberty", color: "#0A254E" },
      { name: "UConn", color: "#000E2F" },
    ]
  }
];
 
// --- AP POLL DATA ---
export const apTop25Data = [
  { rank: 1, name: "Oregon", record: "12-0" },
  { rank: 2, name: "Ohio State", record: "11-1" },
  { rank: 3, name: "Texas", record: "11-1" },
  { rank: 4, name: "Penn State", record: "11-1" },
  { rank: 5, name: "Notre Dame", record: "11-1" },
  { rank: 6, name: "Georgia", record: "10-2" },
  { rank: 7, name: "Tennessee", record: "10-2" },
  { rank: 8, name: "SMU", record: "11-1" },
  { rank: 9, name: "Indiana", record: "11-1" },
  { rank: 10, name: "Boise State", record: "11-1" },
  { rank: 11, name: "Alabama", record: "9-3" },
  { rank: 12, name: "Miami", record: "10-2" },
  { rank: 13, name: "Ole Miss", record: "10-2" },
  { rank: 14, name: "Arizona State", record: "10-2" },
  { rank: 15, name: "BYU", record: "10-2" },
  { rank: 16, name: "Iowa State", record: "10-2" },
  { rank: 17, name: "Clemson", record: "9-3" },
  { rank: 18, name: "South Carolina", record: "9-3" },
  { rank: 19, name: "Army", record: "10-1" },
  { rank: 20, name: "Tulane", record: "10-2" },
  { rank: 21, name: "UNLV", record: "10-2" },
  { rank: 22, name: "Illinois", record: "9-3" },
  { rank: 23, name: "Missouri", record: "9-3" },
  { rank: 24, name: "Colorado", record: "9-3" },
  { rank: 25, name: "Memphis", record: "10-2" },
];
 
// --- HOME PAGE DATA ---
export const CFP_MATCHUPS = [
  { id: 1, home: "Oregon", away: "Ohio State", date: "Jan 20" },
  { id: 2, home: "Georgia", away: "Texas", date: "Jan 21" }
];
 
export const BOWL_GAMES = [
  { id: 1, home: "USC", away: "LSU", date: "Dec 28" },
  { id: 2, home: "Alabama", away: "Michigan", date: "Jan 1" },
  { id: 3, home: "Ole Miss", away: "Iowa", date: "Dec 30" }
];
 
// --- EXPANDED DATA FOR HOME PAGE ---
// UPDATED ORDER BASED ON YOUR LIST
export const FIRST_ROUND_ORDER = [
  { pick: 1, team: "Las Vegas Raiders", needs: "QB" },
  { pick: 2, team: "New York Jets", needs: "QB/OL" },
  { pick: 3, team: "Arizona Cardinals", needs: "DL/EDGE" },
  { pick: 4, team: "Tennessee Titans", needs: "QB/WR" },
  { pick: 5, team: "New York Giants", needs: "QB/OL" },
  { pick: 6, team: "Cleveland Browns", needs: "OT/WR" },
  { pick: 7, team: "Washington Commanders", needs: "CB/OT" },
  { pick: 8, team: "New Orleans Saints", needs: "QB/WR" },
  { pick: 9, team: "Kansas City Chiefs", needs: "WR/CB" },
  { pick: 10, team: "Cincinnati Bengals", needs: "DL/OL" },
  { pick: 11, team: "Miami Dolphins", needs: "OL/DL" },
  { pick: 12, team: "Dallas Cowboys", needs: "RB/DT" },
  { pick: 13, team: "Los Angeles Rams", needs: "CB/OT" },
  { pick: 14, team: "Baltimore Ravens", needs: "OL/EDGE" },
  { pick: 15, team: "Tampa Bay Bucs", needs: "EDGE" },
  { pick: 16, team: "New York Jets", needs: "Best Avail" }, 
  { pick: 17, team: "Detroit Lions", needs: "EDGE/OL" },
  { pick: 18, team: "Minnesota Vikings", needs: "CB/DT" }
];
 
// --- TOP 25 PPR FANTASY ROOKIE RANKINGS (2025 class, 1QB PPR consensus) ---
// Order reflects fantasy value, not NFL draft slot. `team` is the NFL landing spot.
export const FANTASY_ROOKIE_PPR_TOP25 = [
  { rank: 1, name: "Ashton Jeanty", pos: "RB", team: "LV" },
  { rank: 2, name: "Omarion Hampton", pos: "RB", team: "LAC" },
  { rank: 3, name: "Travis Hunter", pos: "WR", team: "JAX" },
  { rank: 4, name: "Tetairoa McMillan", pos: "WR", team: "CAR" },
  { rank: 5, name: "TreVeyon Henderson", pos: "RB", team: "NE" },
  { rank: 6, name: "Quinshon Judkins", pos: "RB", team: "CLE" },
  { rank: 7, name: "Emeka Egbuka", pos: "WR", team: "TB" },
  { rank: 8, name: "Tyler Warren", pos: "TE", team: "IND" },
  { rank: 9, name: "Kaleb Johnson", pos: "RB", team: "PIT" },
  { rank: 10, name: "Colston Loveland", pos: "TE", team: "CHI" },
  { rank: 11, name: "RJ Harvey", pos: "RB", team: "DEN" },
  { rank: 12, name: "Matthew Golden", pos: "WR", team: "GB" },
  { rank: 13, name: "Luther Burden III", pos: "WR", team: "CHI" },
  { rank: 14, name: "Cam Ward", pos: "QB", team: "TEN" },
  { rank: 15, name: "Tre Harris", pos: "WR", team: "LAC" },
  { rank: 16, name: "Jayden Higgins", pos: "WR", team: "HOU" },
  { rank: 17, name: "Cam Skattebo", pos: "RB", team: "NYG" },
  { rank: 18, name: "Jack Bech", pos: "WR", team: "LV" },
  { rank: 19, name: "Jalen Milroe", pos: "QB", team: "SEA" },
  { rank: 20, name: "Jaxson Dart", pos: "QB", team: "NYG" },
  { rank: 21, name: "Tyler Shough", pos: "QB", team: "NO" },
  { rank: 22, name: "Kyle Williams", pos: "WR", team: "NE" },
  { rank: 23, name: "Jaylin Noel", pos: "WR", team: "HOU" },
  { rank: 24, name: "Bhayshul Tuten", pos: "RB", team: "JAX" },
  { rank: 25, name: "Dylan Sampson", pos: "RB", team: "CLE" },
];

// --- 2025 NFL DRAFT: ROUND 1 (actual results, in selection order) ---
// Players listed in the order they were selected (pick 1 -> 32).
export const DRAFT_2025_ROUND_1 = [
  { pick: 1, team: "Tennessee Titans", name: "Cam Ward", pos: "QB", school: "Miami" },
  { pick: 2, team: "Jacksonville Jaguars", name: "Travis Hunter", pos: "WR/CB", school: "Colorado" },
  { pick: 3, team: "New York Giants", name: "Abdul Carter", pos: "EDGE", school: "Penn State" },
  { pick: 4, team: "New England Patriots", name: "Will Campbell", pos: "OT", school: "LSU" },
  { pick: 5, team: "Cleveland Browns", name: "Mason Graham", pos: "DT", school: "Michigan" },
  { pick: 6, team: "Las Vegas Raiders", name: "Ashton Jeanty", pos: "RB", school: "Boise State" },
  { pick: 7, team: "New York Jets", name: "Armand Membou", pos: "OT", school: "Missouri" },
  { pick: 8, team: "Carolina Panthers", name: "Tetairoa McMillan", pos: "WR", school: "Arizona" },
  { pick: 9, team: "New Orleans Saints", name: "Kelvin Banks Jr.", pos: "OT", school: "Texas" },
  { pick: 10, team: "Chicago Bears", name: "Colston Loveland", pos: "TE", school: "Michigan" },
  { pick: 11, team: "San Francisco 49ers", name: "Mykel Williams", pos: "EDGE", school: "Georgia" },
  { pick: 12, team: "Dallas Cowboys", name: "Tyler Booker", pos: "G", school: "Alabama" },
  { pick: 13, team: "Miami Dolphins", name: "Kenneth Grant", pos: "DT", school: "Michigan" },
  { pick: 14, team: "Indianapolis Colts", name: "Tyler Warren", pos: "TE", school: "Penn State" },
  { pick: 15, team: "Atlanta Falcons", name: "Jalon Walker", pos: "LB", school: "Georgia" },
  { pick: 16, team: "Arizona Cardinals", name: "Walter Nolen", pos: "DT", school: "Ole Miss" },
  { pick: 17, team: "Cincinnati Bengals", name: "Shemar Stewart", pos: "EDGE", school: "Texas A&M" },
  { pick: 18, team: "Seattle Seahawks", name: "Grey Zabel", pos: "G", school: "North Dakota State" },
  { pick: 19, team: "Tampa Bay Buccaneers", name: "Emeka Egbuka", pos: "WR", school: "Ohio State" },
  { pick: 20, team: "Denver Broncos", name: "Jahdae Barron", pos: "CB", school: "Texas" },
  { pick: 21, team: "Pittsburgh Steelers", name: "Derrick Harmon", pos: "DT", school: "Oregon" },
  { pick: 22, team: "Los Angeles Chargers", name: "Omarion Hampton", pos: "RB", school: "North Carolina" },
  { pick: 23, team: "Green Bay Packers", name: "Matthew Golden", pos: "WR", school: "Texas" },
  { pick: 24, team: "Minnesota Vikings", name: "Donovan Jackson", pos: "G", school: "Ohio State" },
  { pick: 25, team: "New York Giants", name: "Jaxson Dart", pos: "QB", school: "Ole Miss" },
  { pick: 26, team: "Atlanta Falcons", name: "James Pearce Jr.", pos: "EDGE", school: "Tennessee" },
  { pick: 27, team: "Baltimore Ravens", name: "Malaki Starks", pos: "S", school: "Georgia" },
  { pick: 28, team: "Detroit Lions", name: "Tyleik Williams", pos: "DT", school: "Ohio State" },
  { pick: 29, team: "Washington Commanders", name: "Josh Conerly Jr.", pos: "OT", school: "Oregon" },
  { pick: 30, team: "Buffalo Bills", name: "Maxwell Hairston", pos: "CB", school: "Kentucky" },
  { pick: 31, team: "Philadelphia Eagles", name: "Jihaad Campbell", pos: "LB", school: "Alabama" },
  { pick: 32, team: "Kansas City Chiefs", name: "Josh Simmons", pos: "OT", school: "Ohio State" },
];

// --- BIG BOARD / CURATED PROSPECTS ---
// SEND ME YOUR NEW LIST TO UPDATE THIS!
// --- BIG BOARD / CURATED PROSPECTS ---
export const PROSPECTS_2025 = [
  { id: 1, name: "Jeremiyah Love", school: "Notre Dame", pos: "RB", trend: "up" },
  { id: 2, name: "Makai Lemon", school: "USC", pos: "WR", trend: "up" },
  { id: 3, name: "Jordyn Tyson", school: "Arizona State", pos: "WR", trend: "up" },
  { id: 4, name: "Denzel Boston", school: "Washington", pos: "WR", trend: "flat" },
  { id: 5, name: "Jadarian Price", school: "Notre Dame", pos: "RB", trend: "flat" },
  { id: 6, name: "Jonah Coleman", school: "Washington", pos: "RB", trend: "up" },
  { id: 7, name: "Kenyon Sadiq", school: "Oregon", pos: "TE", trend: "flat" },
  { id: 8, name: "Carnell Tate", school: "Ohio State", pos: "WR", trend: "flat" },
  { id: 9, name: "KC Concepcion", school: "Texas A&M", pos: "WR", trend: "down" }, // Transferred from NC State
  { id: 10, name: "Justice Haynes", school: "Michigan", pos: "RB", trend: "up" }, // Transferred from Alabama
  { id: 11, name: "Chris Bell", school: "Louisville", pos: "WR", trend: "flat" },
  { id: 12, name: "Nicholas Singleton", school: "Penn State", pos: "RB", trend: "down" },
  { id: 13, name: "Emmett Johnson", school: "Nebraska", pos: "RB", trend: "up" },
  { id: 14, name: "Germie Bernard", school: "Alabama", pos: "WR", trend: "flat" },
  { id: 15, name: "Fernando Mendoza", school: "Indiana", pos: "QB", trend: "up" },
  { id: 16, name: "Dante Moore", school: "Oregon", pos: "QB", trend: "flat" },
  { id: 17, name: "Elijah Sarratt", school: "Indiana", pos: "WR", trend: "up" },
  { id: 18, name: "Kaytron Allen", school: "Penn State", pos: "RB", trend: "flat" },
  { id: 19, name: "Ja'Kobi Lane", school: "USC", pos: "WR", trend: "up" },
  { id: 20, name: "Chris Brazzell II", school: "Tennessee", pos: "WR", trend: "flat" },
  { id: 21, name: "LJ Martin", school: "BYU", pos: "RB", trend: "down" },
  { id: 22, name: "Eli Stowers", school: "Vanderbilt", pos: "TE", trend: "up" },
  { id: 23, name: "Antonio Williams", school: "Clemson", pos: "WR", trend: "flat" },
  { id: 24, name: "Michael Trigg", school: "Baylor", pos: "TE", trend: "down" }
];
 
// --- PLAYER ARCHETYPE DATA ---
export const samplePlayers = {
  1: {
    id: 1,
    name: "Shedeur Sanders",
    school: "Colorado",
    position: "QB",
    number: "#2",
    height: "6'2\"",
    weight: "215 lbs",
    class: "Senior",
    stats: {
      passingYards: "3,230",
      tds: "27",
      ints: "3",
      completion: "69.3%",
      epa: "+0.33",
      havocAvoided: "92%"
    },
    scoutingReport: "Elite pocket presence with surgical accuracy. Displays calmness under pressure that translates well to the next level."
  },
  2: {
    id: 2,
    name: "Travis Hunter",
    school: "Colorado",
    position: "WR/CB",
    number: "#12",
    height: "6'1\"",
    weight: "185 lbs",
    class: "Junior",
    stats: {
      receptions: "74",
      yards: "911",
      tds: "9",
      interceptions: "3",
      epa: "+0.45",
      havocCreated: "Elite"
    },
    scoutingReport: "Generational dual-threat talent. Fluid hips at CB and explosive route running at WR. A true game-changer."
  }
};