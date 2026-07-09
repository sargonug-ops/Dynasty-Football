import React, { useState } from 'react';
import './PlayerProfile.css';

// API CONFIG
// Set VITE_CFBD_API_KEY in a local .env file (see .env.example).
const API_KEY = import.meta.env.VITE_CFBD_API_KEY;
const HEADERS = { "Authorization": `Bearer ${API_KEY}` };
const YEAR = 2025; // Target Year for 2026 Draft Class

const PlayerProfile = ({ player, onBack }) => {
  const [activeTab, setActiveTab] = useState('GAME LOG');
  const [seasonExpanded, setSeasonExpanded] = useState(false);
  
  // ADVANCED DATA STATE
  const [advStats, setAdvStats] = useState(null); // Stores both RZ and Betting data
  const [isLoadingAdv, setIsLoadingAdv] = useState(false);

  if (!player) return <div className="profile-container"><div style={{padding: 40}}>Loading Player...</div></div>;

  // --- STANDARD DATA ---
  const stats = player.stats || {};
  const gameLog = player.game_log || [];
  const height = player.height || "N/A"; 
  const weight = player.weight || "N/A";
  const rawYear = player.year || "N/A";
  const age = String(rawYear); 
  const pos = player.pos ? String(player.pos).toUpperCase() : "ATH";
  const isQB = pos.includes('QB');
  const isRB = pos.includes('RB');

  const getPosBadgeColor = (p) => {
    const safeP = String(p).toUpperCase();
    if (safeP.includes('QB')) return '#E03A3E';
    if (safeP.includes('RB')) return '#00C853';
    if (safeP.includes('WR')) return '#2962FF';
    if (safeP.includes('TE')) return '#FF6D00';
    return '#666';
  };

  // --- 🧠 ADVANCED ANALYTICS ENGINE ---
  const fetchAdvancedStats = async () => {
    setIsLoadingAdv(true);
    try {
      // 1. FETCH SCHEDULE (For Dates/Opponents)
      const schedPromises = ['regular', 'postseason'].map(type => 
        fetch(`https://api.collegefootballdata.com/games?year=${YEAR}&team=${player.school}&seasonType=${type}`, { headers: HEADERS })
        .then(res => res.json())
      );
      const schedResults = await Promise.all(schedPromises);
      const allGames = [...schedResults[0], ...schedResults[1]];
      
      const gameMap = {};
      const weeksToFetch = [];

      allGames.forEach(g => {
        gameMap[g.id] = {
          date: g.startDate ? g.startDate.split('T')[0] : 'TBD',
          opponent: (g.homeTeam === player.school) ? g.awayTeam : g.homeTeam,
          week: g.week
        };
        if ((g.homePoints !== null) && !weeksToFetch.includes(g.week)) {
          weeksToFetch.push(g.week);
        }
      });

      // 2. PARALLEL FETCH: RED ZONE PLAYS + BETTING LINES
      const [weeklyPlays, bettingLines] = await Promise.all([
        // A. Fetch Plays
        Promise.all(weeksToFetch.map(week => 
           fetch(`https://api.collegefootballdata.com/plays?year=${YEAR}&team=${player.school}&week=${week}`, { headers: HEADERS })
           .then(res => res.json())
        )),
        // B. Fetch Betting Lines
        fetch(`https://api.collegefootballdata.com/lines?year=${YEAR}&team=${player.school}`, { headers: HEADERS })
        .then(res => res.json())
      ]);

      const allPlays = weeklyPlays.flat();

      // --- PROCESS RED ZONE ---
      const rzData = {};
      allPlays.forEach(play => {
        const gId = String(play.gameId);
        const dId = play.driveId;
        if (!rzData[gId]) {
            rzData[gId] = { team_rz_drives: new Set(), team_td_drives: new Set(), team_fg_drives: new Set(), p_opps: 0, p_yards: 0, p_tds: 0 };
        }
        const d = rzData[gId];

        // Team RZ Logic
        if (play.yardsToGoal <= 20) {
            d.team_rz_drives.add(dId);
            if (play.scoring) {
                if (play.playType.includes("Touchdown")) d.team_td_drives.add(dId);
                if (play.playType.includes("Field Goal")) d.team_fg_drives.add(dId);
            }
        }
        // Player RZ Stats
        if (play.playText && play.playText.includes(player.name) && play.yardsToGoal <= 20) {
             let isValid = false;
             const pType = play.playType;
             if (isQB) { if (pType.includes('Pass') || pType.includes('Rush') || pType.includes('Sack')) isValid = true; } 
             else { if (pType.includes('Pass') || pType.includes('Rush') || pType.includes('Reception') || pType.includes('Touchdown')) isValid = true; }

             if (isValid) {
                 d.p_opps += 1;
                 d.p_yards += play.yardsGained;
                 if (pType.includes("Touchdown")) d.p_tds += 1;
             }
        }
      });

      // --- PROCESS BETTING ---
      const bettingMap = {};
      bettingLines.forEach(game => {
         const gId = String(game.id);
         const lines = game.lines || [];
         if (lines.length === 0) return;
         
         // Priority: Consensus -> DraftKings -> Bovada -> First
         let selected = lines.find(l => l.provider === 'consensus') || 
                        lines.find(l => l.provider === 'DraftKings') || 
                        lines[0];
         
         // Logic to calculate Implied Points
         const rawSpread = selected.spread; // e.g., -10.5
         const overUnder = parseFloat(selected.overUnder);
         const fmtSpread = selected.formattedSpread; // e.g. "Ohio State -10.5"

         let mySpread = parseFloat(rawSpread);
         
         // JS Port of your Python "My Spread" Logic
         // If our school name is in the text, extract that number. 
         // Otherwise, flip the sign (assuming text is for opponent).
         const extractSpread = (str) => {
             const m = str.match(/[-+]?\d*\.?\d+/);
             return m ? parseFloat(m[0]) : 0;
         };

         if (fmtSpread.includes(player.school)) {
             mySpread = extractSpread(fmtSpread);
         } else {
             mySpread = -1 * extractSpread(fmtSpread);
         }

         const impliedPts = (overUnder - mySpread) / 2;
         
         // Simple Win Probability Approx: 50% - (Spread * 2%)
         let winProb = 50 - (mySpread * 2);
         if (winProb > 99) winProb = 99;
         if (winProb < 1) winProb = 1;

         bettingMap[gId] = {
             spread: fmtSpread,
             overUnder: overUnder,
             implied: impliedPts,
             winProb: Math.round(winProb)
         };
      });

      // CALCULATE SEASON AVERAGES (For "Shootout" Label)
      let totalImplied = 0;
      let count = 0;
      Object.values(bettingMap).forEach(b => {
          if(b.implied) { totalImplied += b.implied; count++; }
      });
      const avgImplied = count > 0 ? (totalImplied / count) : 28; // Default to 28 if no data

      // --- MERGE EVERYTHING ---
      const finalRows = [];
      Object.keys(gameMap).forEach(gId => {
         const info = gameMap[gId];
         const rz = rzData[gId] || { team_rz_drives: new Set(), team_td_drives: new Set(), team_fg_drives: new Set(), p_opps: 0, p_yards: 0, p_tds: 0 };
         const bet = bettingMap[gId] || { spread: '-', overUnder: '-', implied: 0, winProb: 50 };

         // RZ Calcs
         const trips = rz.team_rz_drives.size;
         const tds = [...rz.team_td_drives].filter(x => rz.team_rz_drives.has(x)).length;
         const fgs = [...rz.team_fg_drives].filter(x => rz.team_rz_drives.has(x)).length;

         // Context Label Logic
         let contextLabel = "Standard";
         if (bet.implied > (avgImplied * 1.15)) contextLabel = "Shootout";
         else if (bet.implied < (avgImplied * 0.85)) contextLabel = "Defensive";
         else if (bet.winProb > 85) contextLabel = "Blowout Win";
         else if (bet.winProb < 15) contextLabel = "Blowout Loss";

         // Only add if we have some data
         if (trips > 0 || rz.p_opps > 0 || bet.spread !== '-') {
             finalRows.push({
                 id: gId,
                 date: info.date,
                 opponent: info.opponent,
                 // RZ
                 trips, scores: tds+fgs, team_tds: tds, team_fgs: fgs,
                 p_opps: rz.p_opps, p_yards: rz.p_yards, p_tds: rz.p_tds,
                 // Betting
                 spread: bet.spread,
                 overUnder: bet.overUnder,
                 implied: bet.implied,
                 winProb: bet.winProb,
                 context: contextLabel
             });
         }
      });

      finalRows.sort((a,b) => new Date(a.date) - new Date(b.date));
      setAdvStats(finalRows);

    } catch (err) {
      console.error("Error fetching advanced stats:", err);
      alert("Error loading stats. Check console.");
    } finally {
      setIsLoadingAdv(false);
    }
  };

  return (
    <div className="profile-container">
      {/* HERO HEADER */}
      <div className="profile-hero">
        <button onClick={onBack} className="hero-back-btn">&larr; Directory</button>
        <div className="hero-content">
          <div className="hero-avatar-wrapper">
             <div className="hero-avatar">{player.name ? player.name.charAt(0) : '?'}</div>
             <div className="school-logo-badge">{player.school ? player.school.charAt(0) : 'S'}</div>
          </div>
          <div className="hero-details">
            <h1 className="hero-name">{player.name}</h1>
            <div className="hero-vitals-row">
              <span className="vital-item"><span className="vital-label">CLASS</span> {age}</span>
              <span className="vital-divider">|</span>
              <span className="vital-item"><span className="vital-label">HEIGHT</span> {height}</span>
              <span className="vital-divider">|</span>
              <span className="vital-item"><span className="vital-label">WEIGHT</span> {weight}</span>
              <span className="vital-divider">|</span>
              <span className="vital-item school-highlight">{player.school}</span>
            </div>
            <div className="hero-badges-row">
              <span className="pos-badge" style={{ backgroundColor: getPosBadgeColor(pos) }}>{pos}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS - RENAMED 'RED ZONE' TO 'ADVANCED' */}
      <div className="profile-tabs">
        {['GAME LOG', 'ADVANCED', 'OUTLOOK'].map(tab => (
          <button key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="profile-body">
        {/* TAB 1: STANDARD GAME LOG */}
        {activeTab === 'GAME LOG' && (
          <div className="data-card">
             <div className="card-header"><h3>2025 Season Stats</h3></div>
             <table className="profile-table">
               <thead>
                 <tr><th align="left">WEEK</th><th align="left">OPPONENT</th>{isQB && <><th>C/ATT</th><th>YDS</th><th>TD</th><th>INT</th><th>RUSH</th></>}{isRB && <><th>CAR</th><th>YDS</th><th>AVG</th><th>TD</th><th>REC</th></>}{(!isQB && !isRB) && <><th>REC</th><th>YDS</th><th>AVG</th><th>TD</th></>}</tr>
               </thead>
               <tbody>
                 <tr className="highlight-row clickable-row" onClick={() => setSeasonExpanded(!seasonExpanded)}>
                   <td align="left"><span className={`dropdown-caret ${seasonExpanded ? 'open' : ''}`}>▶</span> 2025</td>
                   <td align="left" className="school-text">Season Totals</td>
                   {isQB && <><td>-</td><td className="stat-pop">{stats.s1||0}</td><td className="stat-pop">{stats.s2||0}</td><td>-</td><td>-</td></>}
                   {isRB && <><td>-</td><td className="stat-pop">{stats.s1||0}</td><td>-</td><td className="stat-pop">{stats.s2||0}</td><td>-</td></>}
                   {(!isQB && !isRB) && <><td>-</td><td className="stat-pop">{stats.s1||0}</td><td>-</td><td className="stat-pop">{stats.s2||0}</td></>}
                 </tr>
                 {seasonExpanded && gameLog.map((game, i) => (
                   <tr key={i} className="game-log-row">
                     <td align="left" style={{paddingLeft:'30px'}}>Wk {game.week}</td>
                     <td align="left" style={{color:'#ccc'}}>vs {game.opponent}</td>
                     {isQB && <><td>{game["C/ATT"]}</td><td style={{color:'#fff'}}>{game.PasYds}</td><td style={{color:'#fff'}}>{game.PasTD}</td><td style={{color:'#f44'}}>{game.Int}</td><td>{game.RusYds}</td></>}
                     {isRB && <><td>{game.Car}</td><td style={{color:'#fff'}}>{game.RusYds}</td><td>-</td><td style={{color:'#fff'}}>{game.RusTD}</td><td>{game.Rec}</td></>}
                     {(!isQB && !isRB) && <><td>{game.Rec}</td><td style={{color:'#fff'}}>{game.RecYds}</td><td>-</td><td style={{color:'#fff'}}>{game.RecTD}</td></>}
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {/* TAB 2: ADVANCED (RED ZONE + BETTING) */}
        {activeTab === 'ADVANCED' && (
          <div className="data-card">
            <div className="card-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3>Advanced Scouting (Red Zone & Context)</h3>
                {!advStats && !isLoadingAdv && (
                    <button className="analyze-btn" onClick={fetchAdvancedStats}>Load Advanced Data</button>
                )}
            </div>

            {isLoadingAdv && <div className="loading-zone">Analyzing Matchups & Play Data...</div>}

            {!isLoadingAdv && advStats && (
                <>
                {/* SECTION 1: RED ZONE */}
                <div className="sub-header" style={{padding:'15px 20px', borderBottom:'1px solid #333', color:'#E03A3E', fontWeight:'bold', fontSize:'0.85rem'}}>RED ZONE EFFICIENCY</div>
                <table className="profile-table">
                    <thead>
                        <tr><th align="left">OPPONENT</th><th>TRIPS</th><th>TEAM TD</th><th>CONV %</th><th>PLAYER OPPS</th><th>RZ YDS</th><th>RZ TD</th></tr>
                    </thead>
                    <tbody>
                        {advStats.map((row) => (
                            <tr key={`${row.id}-rz`}>
                                <td align="left" style={{color:'#ccc'}}>{row.opponent}</td>
                                <td>{row.trips}</td>
                                <td style={{color:'#fff'}}>{row.team_tds}</td>
                                <td style={{color: (row.scores/row.trips) > 0.8 ? '#00C853' : '#E03A3E'}}>
                                    {row.trips > 0 ? Math.round((row.scores / row.trips) * 100) : 0}%
                                </td>
                                <td className="stat-pop">{row.p_opps}</td>
                                <td>{row.p_yards}</td>
                                <td style={{color:'#fff'}}>{row.p_tds}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* SECTION 2: BETTING CONTEXT */}
                <div className="sub-header" style={{padding:'15px 20px', borderBottom:'1px solid #333', borderTop:'1px solid #333', color:'#2962FF', fontWeight:'bold', fontSize:'0.85rem', marginTop:'20px'}}>MATCHUP CONTEXT</div>
                <table className="profile-table">
                    <thead>
                        <tr><th align="left">OPPONENT</th><th align="left">SPREAD</th><th>WIN PROB</th><th>O/U</th><th>IMPLIED PTS</th><th>CONTEXT</th></tr>
                    </thead>
                    <tbody>
                        {advStats.map((row) => (
                            <tr key={`${row.id}-bet`}>
                                <td align="left" style={{color:'#ccc'}}>{row.opponent}</td>
                                <td align="left" style={{fontSize:'0.8rem'}}>{row.spread}</td>
                                <td style={{color: row.winProb > 50 ? '#00C853' : '#E03A3E'}}>{row.winProb}%</td>
                                <td>{row.overUnder}</td>
                                <td style={{color:'#fff', fontWeight:'bold'}}>{row.implied.toFixed(1)}</td>
                                <td>
                                    <span className={`ctx-tag ${row.context.replace(' ', '-').toLowerCase()}`}>
                                        {row.context}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </>
            )}
            
            {!isLoadingAdv && !advStats && (
                <div className="empty-state-small">Click "Load Advanced Data" to fetch Red Zone & Betting Analytics.</div>
            )}
          </div>
        )}

        {/* TAB 3: OUTLOOK */}
        {activeTab === 'OUTLOOK' && <div className="empty-state"><h3>Outlook</h3><p>Coming Soon.</p></div>}
      </div>
    </div>
  );
};

export default PlayerProfile;