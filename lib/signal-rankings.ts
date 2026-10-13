import { RULES_VERSION } from './signal-game';
export const SIGNAL_API = (import.meta.env.VITE_SIGNAL_API_URL || '').replace(/\/$/, '');
export const SIGNAL_PREVIEW = /^http:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(SIGNAL_API);
export type SharedRun = { alias: string; cost: number; score: number; recordedAt: number };
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
  if (!SIGNAL_API) throw new Error('Shared rankings are not connected yet.');
  const response = await fetch(SIGNAL_API + path, { ...options, signal: AbortSignal.timeout(8000), credentials: 'omit' });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Rankings are unavailable.');
  return body;
}
export type SharedBoard = { runs: SharedRun[]; tiedForFirst?: number };
export async function loadRankings(day: string): Promise<SharedBoard> {
  const body = await request('/leaderboard?day=' + encodeURIComponent(day));
  if (!Array.isArray(body.runs)) throw new Error('Rankings could not be read.');
  return { runs: body.runs, tiedForFirst: typeof body.tiedForFirst === 'number' ? body.tiedForFirst : undefined };
}
/** Publishes under the callsign when one is given; the service falls back to a generated alias. */
export async function publishRun(day: string, path: number[], name?: string): Promise<string> {
  const body = await request('/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day, path, version: RULES_VERSION, player: playerId(), ...(name ? { name } : {}) }) });
  return body.alias;
}
