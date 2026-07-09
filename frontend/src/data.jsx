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
 
// --- AP POLL DATA (Final 2025 season / 2026 CFP cycle) ---
export const apTop25Data = [
  { rank: 1, name: "Indiana", record: "16-0" },
  { rank: 2, name: "Miami", record: "14-3" },
  { rank: 3, name: "Ole Miss", record: "13-2" },
  { rank: 4, name: "Oregon", record: "13-2" },
  { rank: 5, name: "Ohio State", record: "12-2" },
  { rank: 6, name: "Georgia", record: "12-2" },
  { rank: 7, name: "Texas Tech", record: "12-2" },
  { rank: 8, name: "Texas A&M", record: "11-2" },
  { rank: 9, name: "Alabama", record: "11-3" },
  { rank: 10, name: "Notre Dame", record: "10-2" },
  { rank: 11, name: "BYU", record: "12-2" },
  { rank: 12, name: "Texas", record: "10-3" },
  { rank: 13, name: "Oklahoma", record: "10-3" },
  { rank: 14, name: "Utah", record: "11-2" },
  { rank: 15, name: "Vanderbilt", record: "10-3" },
  { rank: 16, name: "Virginia", record: "11-3" },
  { rank: 17, name: "Iowa", record: "9-4" },
  { rank: 18, name: "Tulane", record: "11-3" },
  { rank: 19, name: "James Madison", record: "12-2" },
  { rank: 20, name: "USC", record: "9-4" },
  { rank: 21, name: "Michigan", record: "9-4" },
  { rank: 22, name: "Houston", record: "10-3" },
  { rank: 23, name: "Navy", record: "10-2" },
  { rank: 24, name: "North Texas", record: "11-2" },
  { rank: 25, name: "TCU", record: "9-4" },
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
 

// --- 2026 NFL DRAFT ROUND 1 (actual selections) ---
export const DRAFT_2026_ROUND_1 = [
  { pick: 1, name: "Fernando Mendoza", team: "LV", pos: "QB" },
  { pick: 2, name: "David Bailey", team: "NYJ", pos: "EDGE" },
  { pick: 3, name: "Jeremiyah Love", team: "ARI", pos: "RB" },
  { pick: 4, name: "Carnell Tate", team: "TEN", pos: "WR" },
  { pick: 5, name: "Arvell Reese", team: "NYG", pos: "EDGE" },
  { pick: 6, name: "Mansoor Delane", team: "KC", pos: "CB" },
  { pick: 7, name: "Sonny Styles", team: "WAS", pos: "LB" },
  { pick: 8, name: "Jordyn Tyson", team: "NO", pos: "WR" },
  { pick: 9, name: "Spencer Fano", team: "CLE", pos: "OT" },
  { pick: 10, name: "Francis Mauigoa", team: "NYG", pos: "OT" },
  { pick: 11, name: "Caleb Downs", team: "DAL", pos: "S" },
  { pick: 12, name: "Kadyn Proctor", team: "MIA", pos: "OT" },
  { pick: 13, name: "Ty Simpson", team: "LAR", pos: "QB" },
  { pick: 14, name: "Olaivavega Ioane", team: "BAL", pos: "G" },
  { pick: 15, name: "Rueben Bain Jr.", team: "TB", pos: "EDGE" },
  { pick: 16, name: "Kenyon Sadiq", team: "NYJ", pos: "TE" },
  { pick: 17, name: "Blake Miller", team: "DET", pos: "OT" },
  { pick: 18, name: "Caleb Banks", team: "MIN", pos: "DT" },
  { pick: 19, name: "Monroe Freeling", team: "CAR", pos: "OT" },
  { pick: 20, name: "Makai Lemon", team: "PHI", pos: "WR" },
  { pick: 21, name: "Max Iheanachor", team: "PIT", pos: "OT" },
  { pick: 22, name: "Akheem Mesidor", team: "LAC", pos: "EDGE" },
  { pick: 23, name: "Malachi Lawrence", team: "DAL", pos: "EDGE" },
  { pick: 24, name: "KC Concepcion", team: "CLE", pos: "WR" },
  { pick: 25, name: "Dillon Thieneman", team: "CHI", pos: "S" },
  { pick: 26, name: "Keylan Rutledge", team: "HOU", pos: "G" },
  { pick: 27, name: "Chris Johnson", team: "MIA", pos: "CB" },
  { pick: 28, name: "Caleb Lomu", team: "NE", pos: "OT" },
  { pick: 29, name: "Peter Woods", team: "KC", pos: "DT" },
  { pick: 30, name: "Omar Cooper Jr.", team: "NYJ", pos: "WR" },
  { pick: 31, name: "Keldric Faulk", team: "TEN", pos: "EDGE" },
  { pick: 32, name: "Jadarian Price", team: "SEA", pos: "RB" }
];

// Back-compat alias
export const DRAFT_2025_ROUND_1 = DRAFT_2026_ROUND_1;

// --- 1QB PPR dynasty rookie rankings (post-2026 draft consensus) ---
export const FANTASY_ROOKIE_PPR_TOP25 = [
  { rank: 1, name: "Jeremiyah Love", pos: "RB", team: "ARI" },
  { rank: 2, name: "Carnell Tate", pos: "WR", team: "TEN" },
  { rank: 3, name: "Jordyn Tyson", pos: "WR", team: "NO" },
  { rank: 4, name: "Makai Lemon", pos: "WR", team: "PHI" },
  { rank: 5, name: "Fernando Mendoza", pos: "QB", team: "LV" },
  { rank: 6, name: "KC Concepcion", pos: "WR", team: "CLE" },
  { rank: 7, name: "Jadarian Price", pos: "RB", team: "SEA" },
  { rank: 8, name: "Kenyon Sadiq", pos: "TE", team: "NYJ" },
  { rank: 9, name: "Omar Cooper Jr.", pos: "WR", team: "NYJ" },
  { rank: 10, name: "Ty Simpson", pos: "QB", team: "LAR" },
  { rank: 11, name: "Denzel Boston", pos: "WR", team: "CLE" },
  { rank: 12, name: "Jonah Coleman", pos: "RB", team: "DEN" },
  { rank: 13, name: "Germie Bernard", pos: "WR", team: "PIT" },
  { rank: 14, name: "Antonio Williams", pos: "WR", team: "WAS" },
  { rank: 15, name: "Eli Stowers", pos: "TE", team: "PHI" },
  { rank: 16, name: "Chris Bell", pos: "WR", team: "MIA" },
  { rank: 17, name: "Chris Brazzell II", pos: "WR", team: "TEN" },
  { rank: 18, name: "Elijah Sarratt", pos: "WR", team: "IND" },
  { rank: 19, name: "Zachariah Branch", pos: "WR", team: "ATL" },
  { rank: 20, name: "Justice Haynes", pos: "RB", team: "DET" },
  { rank: 21, name: "Emmett Johnson", pos: "RB", team: "NE" },
  { rank: 22, name: "Kaytron Allen", pos: "RB", team: "BAL" },
  { rank: 23, name: "Ja'Kobi Lane", pos: "WR", team: "LAR" },
  { rank: 24, name: "Michael Trigg", pos: "TE", team: "DAL" },
  { rank: 25, name: "LJ Martin", pos: "RB", team: "GB" }
];

// --- EXPANDED DATA FOR HOME PAGE ---
// 2026 NFL Draft — Round 1 results
export const FIRST_ROUND_ORDER = [
  { pick: 1, team: "Las Vegas Raiders", needs: "QB · Mendoza" },
  { pick: 2, team: "New York Jets", needs: "EDGE · Bailey" },
  { pick: 3, team: "Arizona Cardinals", needs: "RB · Love" },
  { pick: 4, team: "Tennessee Titans", needs: "WR · Tate" },
  { pick: 5, team: "New York Giants", needs: "EDGE · Reese" },
  { pick: 6, team: "Kansas City Chiefs", needs: "CB · Delane" },
  { pick: 7, team: "Washington Commanders", needs: "LB · Styles" },
  { pick: 8, team: "New Orleans Saints", needs: "WR · Tyson" },
  { pick: 9, team: "Cleveland Browns", needs: "OT · Fano" },
  { pick: 10, team: "New York Giants", needs: "OT · Mauigoa" },
  { pick: 11, team: "Dallas Cowboys", needs: "S · Downs" },
  { pick: 12, team: "Miami Dolphins", needs: "OT · Proctor" },
  { pick: 13, team: "Los Angeles Rams", needs: "QB · Simpson" },
  { pick: 14, team: "Baltimore Ravens", needs: "G · Ioane" },
  { pick: 15, team: "Tampa Bay Bucs", needs: "EDGE · Bain" },
  { pick: 16, team: "New York Jets", needs: "TE · Sadiq" },
  { pick: 17, team: "Detroit Lions", needs: "OT · Miller" },
  { pick: 18, team: "Minnesota Vikings", needs: "DT · Banks" },
  { pick: 19, team: "Carolina Panthers", needs: "OT · Freeling" },
  { pick: 20, team: "Philadelphia Eagles", needs: "WR · Lemon" },
  { pick: 21, team: "Pittsburgh Steelers", needs: "OT · Iheanachor" },
  { pick: 22, team: "Los Angeles Chargers", needs: "EDGE · Mesidor" },
  { pick: 23, team: "Dallas Cowboys", needs: "EDGE · Lawrence" },
  { pick: 24, team: "Cleveland Browns", needs: "WR · Concepcion" },
  { pick: 25, team: "Chicago Bears", needs: "S · Thieneman" },
  { pick: 26, team: "Houston Texans", needs: "G · Rutledge" },
  { pick: 27, team: "Miami Dolphins", needs: "CB · Johnson" },
  { pick: 28, team: "New England Patriots", needs: "OT · Lomu" },
  { pick: 29, team: "Kansas City Chiefs", needs: "DT · Woods" },
  { pick: 30, team: "New York Jets", needs: "WR · Cooper" },
  { pick: 31, team: "Tennessee Titans", needs: "EDGE · Faulk" },
  { pick: 32, team: "Seattle Seahawks", needs: "RB · Price" }
];

// --- BIG BOARD / CURATED PROSPECTS ---
// Offensive skill-position board for the 2026 NFL Draft class
export const PROSPECTS_2026 = [
  { id: 4837248, name: "Fernando Mendoza", school: "Indiana", pos: "QB", trend: "up" },
  { id: 4870808, name: "Jeremiyah Love", school: "Notre Dame", pos: "RB", trend: "up" },
  { id: 4871023, name: "Carnell Tate", school: "Ohio State", pos: "WR", trend: "up" },
  { id: 4880281, name: "Jordyn Tyson", school: "Arizona State", pos: "WR", trend: "up" },
  { id: 4870795, name: "Makai Lemon", school: "USC", pos: "WR", trend: "up" },
  { id: 5083315, name: "Kenyon Sadiq", school: "Oregon", pos: "TE", trend: "flat" },
  { id: 4685522, name: "Ty Simpson", school: "Alabama", pos: "QB", trend: "up" },
  { id: 4723820, name: "Omar Cooper Jr.", school: "Indiana", pos: "WR", trend: "up" },
  { id: 4870653, name: "KC Concepcion", school: "Texas A&M", pos: "WR", trend: "flat" },
  { id: 4685512, name: "Jadarian Price", school: "Notre Dame", pos: "RB", trend: "flat" },
  { id: 4832800, name: "Denzel Boston", school: "Washington", pos: "WR", trend: "flat" },
  { id: 4702555, name: "Jonah Coleman", school: "Washington", pos: "RB", trend: "up" },
  { id: 4869961, name: "Chris Bell", school: "Louisville", pos: "WR", trend: "flat" },
  { id: 4685261, name: "Germie Bernard", school: "Alabama", pos: "WR", trend: "flat" },
  { id: 5091739, name: "Chris Brazzell II", school: "Tennessee", pos: "WR", trend: "flat" },
  { id: 5088338, name: "Elijah Sarratt", school: "Indiana", pos: "WR", trend: "up" },
  { id: 4431574, name: "Eli Stowers", school: "Vanderbilt", pos: "TE", trend: "up" },
  { id: 4832955, name: "Emmett Johnson", school: "Nebraska", pos: "RB", trend: "up" },
  { id: 4685246, name: "Kaytron Allen", school: "Penn State", pos: "RB", trend: "flat" },
  { id: 5081432, name: "Antonio Williams", school: "Clemson", pos: "WR", trend: "flat" },
  { id: 4594749, name: "Michael Trigg", school: "Baylor", pos: "TE", trend: "down" },
  { id: 4870760, name: "Justice Haynes", school: "Michigan", pos: "RB", trend: "up" },
  { id: 4918126, name: "LJ Martin", school: "BYU", pos: "RB", trend: "down" },
  { id: 4870847, name: "Ja'Kobi Lane", school: "USC", pos: "WR", trend: "up" }
];

// Back-compat alias for any lingering imports
export const PROSPECTS_2025 = PROSPECTS_2026;
 
// --- PLAYER ARCHETYPE DATA ---
export const samplePlayers = {
  4837248: {
    id: 4837248,
    name: "Fernando Mendoza",
    school: "Indiana",
    position: "QB",
    number: "#15",
    height: "6'5\"",
    weight: "225 lbs",
    class: "Junior",
    stats: {
      passingYards: "3,811",
      tds: "48",
      ints: "6",
      completion: "71.2%",
      epa: "+0.41",
      havocAvoided: "94%"
    },
    scoutingReport: "Heisman-winning pocket passer who led Indiana to a perfect national title season. Elite processing, anticipation, and toughness under pressure."
  },
  4870808: {
    id: 4870808,
    name: "Jeremiyah Love",
    school: "Notre Dame",
    position: "RB",
    number: "#4",
    height: "6'0\"",
    weight: "214 lbs",
    class: "Junior",
    stats: {
      rushingYards: "1,652",
      tds: "21",
      receptions: "27",
      ypc: "6.1",
      epa: "+0.38",
      havocCreated: "Elite"
    },
    scoutingReport: "Prototype every-down back with home-run speed and receiving polish. The clear RB1 of the 2026 class and a top-three overall talent."
  }
};
