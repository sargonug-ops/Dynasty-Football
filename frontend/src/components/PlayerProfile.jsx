import React, { useState } from 'react';
import './PlayerProfile.css';
import { fetchPlayerAdvancedStats, ApiError } from '../api';

const PlayerProfile = ({ player, onBack }) => {
  const [activeTab, setActiveTab] = useState('GAME LOG');
  const [seasonExpanded, setSeasonExpanded] = useState(false);

  // ADVANCED DATA STATE
  const [advStats, setAdvStats] = useState(null);
  const [isLoadingAdv, setIsLoadingAdv] = useState(false);
  const [advError, setAdvError] = useState(null);

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

  // --- ADVANCED ANALYTICS (server-side via FastAPI) ---
  const loadAdvancedStats = async () => {
    setIsLoadingAdv(true);
    setAdvError(null);
    try {
      const result = await fetchPlayerAdvancedStats({
        name: player.name,
        school: player.school,
        position: pos,
      });
      setAdvStats(result.games || []);
    } catch (err) {
      console.error("Error fetching advanced stats:", err);
      const message = err instanceof ApiError
        ? err.message
        : "Error loading advanced stats.";
      setAdvError(message);
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

      {/* TABS */}
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
             <div className="card-header"><h3>2025 College Season Stats</h3></div>
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
                    <button className="analyze-btn" onClick={loadAdvancedStats}>Load Advanced Data</button>
                )}
            </div>

            {isLoadingAdv && <div className="loading-zone">Analyzing Matchups & Play Data...</div>}

            {!isLoadingAdv && advError && (
                <div className="empty-state-small" style={{color:'#f0a3a3'}}>
                  ⚠️ {advError}
                  <div style={{marginTop: 12}}>
                    <button className="analyze-btn" onClick={loadAdvancedStats}>Retry</button>
                  </div>
                </div>
            )}

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
                                <td style={{color:'#fff', fontWeight:'bold'}}>
                                  {typeof row.implied === 'number' ? row.implied.toFixed(1) : row.implied}
                                </td>
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

            {!isLoadingAdv && !advStats && !advError && (
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
