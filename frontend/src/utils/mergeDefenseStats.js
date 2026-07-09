// Pure functions for merging live /defenses API rows onto the frontend's
// static team metadata (names/colors/conference groupings). Kept dependency
// free (no React) so the join logic can be unit tested directly.

function normalizeKey(name) {
  return (name || '').trim().toLowerCase();
}

function buildDefenseIndex(apiRows) {
  const index = new Map();
  for (const row of apiRows || []) {
    const key = normalizeKey(row.team_name);
    if (key) index.set(key, row);
  }
  return index;
}

function toNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/**
 * Attaches live havoc/sacks/turnover stats onto a list of teams that have
 * at least a `name` (and optionally a `cfbdName` override for teams whose
 * display name is an abbreviation of the API's canonical school name).
 */
export function attachDefenseStats(teams, apiRows) {
  const index = buildDefenseIndex(apiRows);
  return (teams || []).map((team) => {
    const lookupKey = normalizeKey(team.cfbdName || team.name);
    const stats = index.get(lookupKey);
    return {
      ...team,
      havoc: stats ? toNumberOrNull(stats.havoc_score) : null,
      sacksPg: stats ? toNumberOrNull(stats.sacks_pg) : null,
      turnoversPg: stats ? toNumberOrNull(stats.turnovers_pg) : null,
      updatedAt: stats ? stats.updated_at : null,
      hasLiveStats: Boolean(stats),
    };
  });
}

/** Merges live stats into every conference's team list. */
export function mergeConferenceData(conferenceData, apiRows) {
  return (conferenceData || []).map((conf) => ({
    ...conf,
    teams: attachDefenseStats(conf.teams, apiRows),
  }));
}

/**
 * Builds the enriched AP Top 25 list by cross-referencing each ranked team
 * against the (already stats-merged) conference data to pick up its color
 * and live defensive numbers.
 */
export function buildEnrichedTop25(apTop25Data, mergedConferenceData) {
  const lookup = new Map();
  for (const conf of mergedConferenceData || []) {
    for (const team of conf.teams) {
      lookup.set(normalizeKey(team.name), team);
    }
  }

  return (apTop25Data || []).map((apTeam) => {
    const match = lookup.get(normalizeKey(apTeam.name));
    return {
      ...apTeam,
      havoc: match ? match.havoc : null,
      sacksPg: match ? match.sacksPg : null,
      turnoversPg: match ? match.turnoversPg : null,
      color: match ? match.color : '#333',
      darkText: match ? match.darkText : false,
      hasLiveStats: match ? match.hasLiveStats : false,
    };
  });
}

/** Returns the most recent updated_at across all rows, or null if none. */
export function getLatestUpdatedAt(apiRows) {
  const timestamps = (apiRows || [])
    .map((r) => r.updated_at)
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t));

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps));
}
