import React from 'react';
import './HomeDashboard.css';
import { CFP_MATCHUPS, BOWL_GAMES, FANTASY_ROOKIE_PPR_TOP25, DRAFT_2025_ROUND_1 } from '../data';

const HomeDashboard = ({ setView }) => {
  return (
    <div className="home-dashboard">
      
      {/* 1. HERO BANNER */}
      <div className="welcome-card">
        <div className="welcome-text">
          <h1>Dynasty Scout</h1>
          <p>Your War Room for the 2025 Rookie Draft.</p>
        </div>
        <button className="primary-btn" onClick={() => setView('rankings')}>
          Analyze Defense &rarr;
        </button>
      </div>

      {/* 2. MAIN GRID */}
      <div className="home-grid">
        
        {/* COL 1: GAMES (Auto Height) */}
        <div className="home-column">
          <div className="dashboard-card auto-height"> 
            <div className="section-title">🏆 CFP Bracket</div>
            <div className="scroll-area">
              {CFP_MATCHUPS.map((game) => (
                <div key={game.id} className="match-item">
                  <div className="match-teams">{game.home} vs {game.away}</div>
                  <div className="match-time">{game.date}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card auto-height">
            <div className="section-title">🏈 Bowl Season</div>
            <div className="scroll-area">
              {BOWL_GAMES.map((game) => (
                <div key={game.id} className="match-item">
                  <div className="match-teams">{game.home} vs {game.away}</div>
                  <div className="match-time">{game.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COL 2: FANTASY ROOKIE RANKINGS (Fixed Height) */}
        <div className="home-column">
          <div className="dashboard-card fixed-height">
            <div className="section-title">🏆 Top 25 PPR Rookies</div>
            <div className="scroll-area">
              {FANTASY_ROOKIE_PPR_TOP25.map((item) => (
                <div key={item.rank} className="order-row">
                  <div className="pick-info">
                    <span className="pick-num">{item.rank}</span>
                    <span className="team-name">{item.name}</span>
                  </div>
                  <span className="team-needs">{item.pos} &middot; {item.team}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COL 3: FIRST ROUND (Fixed Height) */}
        <div className="home-column">
          <div className="dashboard-card fixed-height">
            <div className="section-title">🏈 2025 Draft &bull; Round 1</div>
            <div className="scroll-area">
              {DRAFT_2025_ROUND_1.map((p) => (
                <div key={p.pick} className="draft-item">
                  <div className="player-main">
                    <div className="rank-badge">{p.pick}</div>
                    <div className="player-name">{p.name}</div>
                  </div>

                  <div className="player-meta">
                    <span className="school">{p.team}</span>
                    <span className="pos-tag">{p.pos}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeDashboard;