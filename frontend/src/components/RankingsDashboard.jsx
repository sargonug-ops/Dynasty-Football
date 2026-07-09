import React, { useEffect, useMemo, useState } from 'react';
import './RankingsDashboard.css';
import { conferenceData, apTop25Data } from '../data';
import { fetchDefenses, ApiError } from '../api';
import { mergeConferenceData, buildEnrichedTop25, getLatestUpdatedAt } from '../utils/mergeDefenseStats';

const TeamRow = ({ team, rank }) => (
  <div className="team-row">
    <div className="rank-box" style={{ backgroundColor: team.color || '#333', color: team.darkText ? '#000' : '#fff' }}>
      {rank}
    </div>
    <div className="team-info">
      <span className="team-name-large">{team.name}</span>
      <div style={{ display: 'flex', gap: '10px' }}>
        <span className="stat-pill havoc-score">
          Havoc: {team.havoc != null ? team.havoc.toFixed(1) : '-'}
        </span>
        <span className="stat-pill">
          Sacks/G: {team.sacksPg != null ? team.sacksPg.toFixed(1) : '-'}
        </span>
        <span className="stat-pill">
          TO/G: {team.turnoversPg != null ? team.turnoversPg.toFixed(1) : '-'}
        </span>
      </div>
    </div>
  </div>
);

const ConferenceCard = ({ title, teams }) => (
  <div className="conference-card">
    <div className="conference-header">
      <span>{title}</span>
      <span>{teams.length} Teams</span>
    </div>
    <div className="table-container">
        {teams.map((team, index) => (
          <TeamRow
            key={team.name}
            rank={team.rank || index + 1}
            team={team}
          />
        ))}
    </div>
  </div>
);

/** Sorts a conference's teams by live havoc score (highest first). Teams
 * with no live stats yet (API unavailable, or no match found) sink to the
 * bottom instead of breaking the sort. */
function sortByHavocDesc(teams) {
  return [...teams].sort((a, b) => {
    if (a.havoc == null && b.havoc == null) return 0;
    if (a.havoc == null) return 1;
    if (b.havoc == null) return -1;
    return b.havoc - a.havoc;
  });
}

function formatLastUpdated(date) {
  if (!date) return null;
  return date.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

const RankingsDashboard = () => {
  const [defenses, setDefenses] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchDefenses()
      .then((rows) => {
        if (!cancelled) {
          setDefenses(rows);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load defensive stats.');
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  const mergedConferenceData = useMemo(
    () => mergeConferenceData(conferenceData, defenses || []),
    [defenses]
  );

  const sortedConferenceData = useMemo(
    () => mergedConferenceData.map((conf) => ({ ...conf, teams: sortByHavocDesc(conf.teams) })),
    [mergedConferenceData]
  );

  const enrichedTop25 = useMemo(
    () => buildEnrichedTop25(apTop25Data, mergedConferenceData),
    [mergedConferenceData]
  );

  const lastUpdated = useMemo(() => formatLastUpdated(getLatestUpdatedAt(defenses || [])), [defenses]);

  return (
    <div className="dashboard-container">
      <div className="rankings-status-bar">
        {isLoading && <span className="rankings-status-pill">Loading live defensive stats…</span>}
        {!isLoading && error && (
          <span className="rankings-status-pill rankings-status-pill--error">
            ⚠️ {error} — showing teams without live stats.
          </span>
        )}
        {!isLoading && !error && lastUpdated && (
          <span className="rankings-status-pill">📡 Defensive stats last updated: {lastUpdated}</span>
        )}
      </div>

      <div className="conference-grid">
        {/* Render the Enriched Top 25 List */}
        <ConferenceCard title="AP Top 25" teams={enrichedTop25} />

        {/* Render the rest of the conferences, sorted by live havoc score */}
        {sortedConferenceData.map((conf) => (
          <ConferenceCard key={conf.name} title={conf.name} teams={conf.teams} />
        ))}
      </div>
    </div>
  );
};

export default RankingsDashboard;
