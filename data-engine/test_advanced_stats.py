"""Unit tests for advanced_stats helpers (no live CFBD calls)."""

from __future__ import annotations

import unittest
from unittest.mock import patch

from advanced_stats import (
    _context_label,
    _extract_spread,
    _is_valid_player_rz_play,
    _process_betting,
    _process_red_zone,
    build_advanced_stats,
)


class HelperTests(unittest.TestCase):
    def test_extract_spread(self):
        self.assertEqual(_extract_spread("Ohio State -14.5"), -14.5)
        self.assertEqual(_extract_spread("Michigan +3"), 3.0)
        self.assertEqual(_extract_spread(""), 0.0)

    def test_is_valid_player_rz_play(self):
        self.assertTrue(_is_valid_player_rz_play("Pass Reception", is_qb=False))
        self.assertTrue(_is_valid_player_rz_play("Rush", is_qb=True))
        self.assertFalse(_is_valid_player_rz_play("Penalty", is_qb=False))
        self.assertFalse(_is_valid_player_rz_play("Kickoff", is_qb=True))

    def test_context_label(self):
        self.assertEqual(_context_label(40, 28, 60), "Shootout")
        self.assertEqual(_context_label(20, 28, 60), "Defensive")
        self.assertEqual(_context_label(28, 28, 90), "Blowout Win")
        self.assertEqual(_context_label(28, 28, 10), "Blowout Loss")
        self.assertEqual(_context_label(28, 28, 55), "Standard")

    def test_process_red_zone_counts_player_opps(self):
        plays = [
            {
                "gameId": 10,
                "driveId": "d1",
                "yardsToGoal": 12,
                "playType": "Pass Reception",
                "playText": "Will Howard pass complete to Jeremiah Smith for 8 yards",
                "yardsGained": 8,
                "scoring": False,
            },
            {
                "gameId": 10,
                "driveId": "d1",
                "yardsToGoal": 4,
                "playType": "Passing Touchdown",
                "playText": "Will Howard pass complete to Jeremiah Smith for 4 yards TOUCHDOWN",
                "yardsGained": 4,
                "scoring": True,
            },
        ]
        rz = _process_red_zone(plays, "Jeremiah Smith", is_qb=False)
        self.assertEqual(rz["10"]["p_opps"], 2)
        self.assertEqual(rz["10"]["p_yards"], 12)
        self.assertEqual(rz["10"]["p_tds"], 1)
        self.assertEqual(len(rz["10"]["team_rz_drives"]), 1)
        self.assertEqual(len(rz["10"]["team_td_drives"]), 1)

    def test_process_betting_uses_formatted_spread(self):
        lines = [
            {
                "id": 10,
                "lines": [
                    {
                        "provider": "consensus",
                        "formattedSpread": "Ohio State -7.0",
                        "overUnder": 45.5,
                    }
                ],
            }
        ]
        betting = _process_betting(lines, "Ohio State")
        self.assertIn("10", betting)
        self.assertEqual(betting["10"]["spread"], "Ohio State -7.0")
        self.assertEqual(betting["10"]["overUnder"], 45.5)
        self.assertAlmostEqual(betting["10"]["implied"], 26.25)
        self.assertEqual(betting["10"]["winProb"], 64)


class BuildAdvancedStatsTests(unittest.TestCase):
    def test_build_advanced_stats_row_shape(self):
        fake_games = [
            {
                "id": 10,
                "homeTeam": "Ohio State",
                "awayTeam": "Michigan",
                "homePoints": 30,
                "awayPoints": 20,
                "week": 1,
                "startDate": "2025-09-01T00:00:00.000Z",
            }
        ]
        fake_plays = [
            {
                "gameId": 10,
                "driveId": "d1",
                "yardsToGoal": 8,
                "playType": "Rush",
                "playText": "Quinshon Judkins run for 5 yards",
                "yardsGained": 5,
                "scoring": False,
            }
        ]
        fake_lines = [
            {
                "id": 10,
                "lines": [
                    {
                        "provider": "consensus",
                        "formattedSpread": "Ohio State -7.0",
                        "overUnder": 45.5,
                    }
                ],
            }
        ]

        def fake_fetch_games(year, team, season_type="regular"):
            # Only the regular season has been played in this fixture.
            return fake_games if season_type == "regular" else []

        with (
            patch("advanced_stats.fetch_games", side_effect=fake_fetch_games),
            patch("advanced_stats.fetch_plays", return_value=fake_plays),
            patch("advanced_stats.fetch_lines", return_value=fake_lines),
        ):
            rows = build_advanced_stats(
                "Quinshon Judkins", "Ohio State", "RB", year=2025
            )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row["id"], "10")
        self.assertEqual(row["opponent"], "Michigan")
        self.assertEqual(row["p_opps"], 1)
        self.assertEqual(row["p_yards"], 5)
        self.assertEqual(row["trips"], 1)
        self.assertIn("spread", row)
        self.assertIn("context", row)
        self.assertIn("winProb", row)

    def test_requires_name_and_school(self):
        with self.assertRaises(ValueError):
            build_advanced_stats("", "Ohio State", "RB", 2025)


if __name__ == "__main__":
    unittest.main()
