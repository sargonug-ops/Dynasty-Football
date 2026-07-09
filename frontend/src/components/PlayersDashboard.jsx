import React, { useState } from 'react';
import './PlayersDashboard.css';
import { PLAYER_DATABASE } from '../data'; // <--- Using the Big Database

const PLAYERS_PER_PAGE = 50;

const PlayersDashboard = ({ onPlayerClick }) => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // SAFETY: If data is missing, default to empty array
  const safePlayers = PLAYER_DATABASE || [];

  // Filter Logic
  const filteredPlayers = safePlayers.filter(p => {
    // 1. Tab Filter
    const matchesTab = activeTab === 'ALL' 
      ? true 
      : p.pos && p.pos.includes(activeTab); 

    // 2. Search Filter
    // Ensure name/school exist before lowercasing to avoid crash
    const nameMatch = p.name ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const schoolMatch = p.school ? p.school.toLowerCase().includes(searchTerm.toLowerCase()) : false;

    return matchesTab && (nameMatch || schoolMatch);
  });

  // Changing a filter jumps back to the first page so users never land on a
  // now-empty page.
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Pagination: cap the list at PLAYERS_PER_PAGE rows per page.
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PLAYERS_PER_PAGE;
  const pagePlayers = filteredPlayers.slice(pageStart, pageStart + PLAYERS_PER_PAGE);

  return (
    <div className="players-dashboard">
      
      {/* Header */}
      <div className="players-header-row">
        <h1 className="page-title">2026 Draft Class Database</h1>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder="Search Player or School..." 
            className="player-search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-row">
        {['ALL', 'QB', 'RB', 'WR', 'TE'].map(type => (
          <button 
            key={type}
            className={`filter-pill ${activeTab === type ? 'active' : ''}`}
            onClick={() => handleTabChange(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* The Table */}
      <div className="table-container">
        {filteredPlayers.length > 0 ? (
          <table className="players-table">
            <thead>
              <tr>
                <th className="th-rank">#</th>
                <th className="th-player">PLAYER</th>
                <th className="th-team">SCHOOL</th>
                <th className="th-stat">YDS</th>
                <th className="th-stat">TD</th>
                <th className="th-stat">AVG</th>
                <th className="th-trend">TREND</th>
              </tr>
            </thead>
            <tbody>
              {pagePlayers.map((player, index) => {
                // Fallback to '-' if missing
                const s1 = player.stats?.s1 || '-';
                const s2 = player.stats?.s2 || '-';
                const s3 = player.stats?.s3 || '-';

                return (
                  <tr key={player.id} onClick={() => onPlayerClick(player.id)}>
                    <td className="td-rank">{pageStart + index + 1}</td>
                    <td className="td-player">
                      <div className="player-cell">
                        <div className="player-avatar-small">
                          {player.name ? player.name.charAt(0) : '?'}
                        </div>
                        <div className="player-info">
                          <span className="p-name">{player.name}</span>
                          <span className="p-pos">{player.pos}</span>
                        </div>
                      </div>
                    </td>
                    <td className="td-team">
                      <span className="team-pill">{player.school}</span>
                    </td>
                    
                    <td className="td-stat">{s1}</td>
                    <td className="td-stat">{s2}</td>
                    <td className="td-stat">{s3}</td>
                    
                    <td className="td-trend">
                      <span className={`trend-tag ${player.trend || 'flat'}`}>
                        {player.trend === 'up' ? '▲' : player.trend === 'down' ? '▼' : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <h2>No players found.</h2>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPlayers.length > 0 && (
        <div className="pagination-row">
          <span className="page-summary">
            Showing {pageStart + 1}&ndash;{pageStart + pagePlayers.length} of {filteredPlayers.length}
          </span>
          <div className="page-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              &larr; Prev
            </button>
            <span className="page-info">Page {safePage} of {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersDashboard;