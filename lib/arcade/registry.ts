/**
 * The weekly game slot. Shared by the site and the leaderboard worker, so it
 * imports no React: only each game's id, version and replay scorer.
 *
 * To add next week's game: write its engine under lib/arcade/, register it in
 * GAMES, add its screen in components/arcade/games.tsx, then add a SCHEDULE
 * line for the week it starts. Deploy the worker and the site together.
 */
import { BOX_RUSH_VERSION, scoreBoxRush } from './box-rush';
import { weekOf } from './week';

export type ArcadeGame = {
  id: string;
  version: string;
  title: string;
  /** Upper bound on the submitted JSON body, checked before parsing. */
  maxBytes: number;
  /** Rebuilds the score from the run. Throws on any run the game could not produce. */
  score(week: string, replay: unknown): { score: number };
};

export const GAMES: Record<string, ArcadeGame> = {
  'box-rush': { id: 'box-rush', version: BOX_RUSH_VERSION, title: 'Box Rush', maxBytes: 16_384, score: scoreBoxRush },
};

/** Which game runs from which ISO week (UTC, Monday 00:00). The latest entry at or before a week wins. */
export const SCHEDULE: { from: string; game: keyof typeof GAMES }[] = [
  { from: '2026-W42', game: 'box-rush' },
];

export function gameForWeek(week = weekOf()): ArcadeGame {
  // ISO week strings compare correctly as text: 2026-W09 < 2026-W42 < 2027-W01.
  const entry = [...SCHEDULE].reverse().find(item => item.from <= week) ?? SCHEDULE[0];
  return GAMES[entry.game];
}
