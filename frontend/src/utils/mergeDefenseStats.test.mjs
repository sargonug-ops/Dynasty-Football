// Lightweight, dependency-free smoke test for the /defenses merge logic.
// Run with: node src/utils/mergeDefenseStats.test.mjs
import assert from 'node:assert/strict';
import {
  attachDefenseStats,
  mergeConferenceData,
  buildEnrichedTop25,
  getLatestUpdatedAt,
} from './mergeDefenseStats.js';

// Simulates a JSON response from GET /defenses (data-engine/main.py).
const apiRows = [
  { team_name: 'South Carolina', havoc_score: 73.4, sacks_pg: 2.1, turnovers_pg: 1.3, updated_at: '2024-12-01T10:00:00' },
  { team_name: 'Ohio State', havoc_score: 91.2, sacks_pg: 3.4, turnovers_pg: 1.8, updated_at: '2024-12-02T10:00:00' },
  { team_name: 'Georgia', havoc_score: 88.0, sacks_pg: 2.9, turnovers_pg: 1.5, updated_at: '2024-11-30T10:00:00' },
];

// --- attachDefenseStats: matches via cfbdName when present ---
{
  const teams = [
    { name: 'S. Carolina', cfbdName: 'South Carolina', color: '#73000A' },
    { name: 'Ohio State', color: '#BB0000' },
    { name: 'Some Random FCS School', color: '#000000' },
  ];

  const result = attachDefenseStats(teams, apiRows);

  assert.equal(result[0].havoc, 73.4, 'cfbdName-mapped team should match on canonical name');
  assert.equal(result[0].sacksPg, 2.1);
  assert.equal(result[0].hasLiveStats, true);

  assert.equal(result[1].havoc, 91.2, 'direct name match should work without cfbdName');

  assert.equal(result[2].havoc, null, 'unmatched team should get null, not throw or crash');
  assert.equal(result[2].hasLiveStats, false);

  console.log('✅ attachDefenseStats: cfbdName + direct matching + graceful miss');
}

// --- mergeConferenceData: preserves conference structure ---
{
  const conferenceData = [
    { name: 'SEC', teams: [{ name: 'Georgia', color: '#BA0C2F' }] },
    { name: 'Big Ten', teams: [{ name: 'Ohio State', color: '#BB0000' }] },
  ];

  const merged = mergeConferenceData(conferenceData, apiRows);

  assert.equal(merged.length, 2);
  assert.equal(merged[0].name, 'SEC');
  assert.equal(merged[0].teams[0].havoc, 88.0);
  assert.equal(merged[1].teams[0].havoc, 91.2);

  console.log('✅ mergeConferenceData: preserves conference grouping, merges stats per team');
}

// --- buildEnrichedTop25: cross-references AP poll against merged conference data ---
{
  const conferenceData = [
    { name: 'SEC', teams: [{ name: 'Georgia', color: '#BA0C2F' }] },
    { name: 'Big Ten', teams: [{ name: 'Ohio State', color: '#BB0000' }] },
  ];
  const mergedConferenceData = mergeConferenceData(conferenceData, apiRows);

  const apTop25Data = [
    { rank: 1, name: 'Ohio State', record: '11-1' },
    { rank: 2, name: 'Georgia', record: '10-2' },
    { rank: 3, name: 'Unranked Team Not In Any Conference List', record: '9-3' },
  ];

  const enriched = buildEnrichedTop25(apTop25Data, mergedConferenceData);

  assert.equal(enriched[0].havoc, 91.2);
  assert.equal(enriched[0].color, '#BB0000');
  assert.equal(enriched[1].havoc, 88.0);
  assert.equal(enriched[2].havoc, null, 'team missing from conference data should not crash');
  assert.equal(enriched[2].color, '#333', 'fallback color should apply when no match found');

  console.log('✅ buildEnrichedTop25: cross-references AP poll with live stats + colors');
}

// --- getLatestUpdatedAt ---
{
  const latest = getLatestUpdatedAt(apiRows);
  assert.equal(latest.toISOString(), new Date('2024-12-02T10:00:00').toISOString());

  assert.equal(getLatestUpdatedAt([]), null, 'empty input should return null, not throw');
  assert.equal(getLatestUpdatedAt(null), null, 'null input should return null, not throw');

  console.log('✅ getLatestUpdatedAt: picks the most recent timestamp, handles empty input');
}

console.log('\nAll mergeDefenseStats tests passed.');
