/** Client for the weekly scoreboard worker (game-worker/). The env var keeps its original name. */
export const ARCADE_API = (import.meta.env.VITE_SIGNAL_API_URL || '').replace(/\/$/, '');
export const ARCADE_PREVIEW = /^http:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(ARCADE_API);
export type ScoreRow = { alias: string; score: number; recordedAt: number };
export type Champion = { week: string; game: string; alias: string; score: number };
export type WeekBoard = { week: string; scores: ScoreRow[]; tiedForFirst: number };

const PLAYER_KEY = 'portfolio.signal-player.v1';
let memoryPlayer: string | undefined;
function playerId() {
  if (memoryPlayer) return memoryPlayer;
  try { const saved = localStorage.getItem(PLAYER_KEY); if (saved && /^[a-f0-9-]{36}$/i.test(saved)) memoryPlayer = saved; } catch { /* Session fallback. */ }
  memoryPlayer ??= crypto.randomUUID();
  try { localStorage.setItem(PLAYER_KEY, memoryPlayer); } catch { /* Session fallback. */ }
  return memoryPlayer;
}

async function request(path: string, options?: RequestInit) {
  if (!ARCADE_API) throw new Error('The shared scoreboard is not connected yet.');
  const response = await fetch(ARCADE_API + path, { ...options, signal: AbortSignal.timeout(8000), credentials: 'omit' });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'The scoreboard is unavailable.');
  return body;
}

export async function loadWeek(week: string): Promise<WeekBoard> {
  const body = await request('/leaderboard?week=' + encodeURIComponent(week));
  if (!Array.isArray(body.scores)) throw new Error('The scoreboard could not be read.');
  return { week: body.week, scores: body.scores, tiedForFirst: Number(body.tiedForFirst) || 0 };
}

export async function loadChampions(): Promise<Champion[]> {
  const body = await request('/champions');
  if (!Array.isArray(body.champions)) throw new Error('The hall of fame could not be read.');
  return body.champions;
}

/** Publishes under the callsign when one is given; the worker otherwise uses a generated alias. */
export async function publishRun(run: { week: string; game: string; version: string; replay: unknown; name?: string }): Promise<{ alias: string; score: number; best: number; place?: number }> {
  return request('/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...run, player: playerId() }) });
}
