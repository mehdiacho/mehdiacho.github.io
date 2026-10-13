/** Signal Run v1: deterministic daily boards, shared by browser and replay verifier. */
export const RULES_VERSION = 'signal-v1';
export const STORAGE_KEY = 'portfolio.signal-run.v1';
export const MAX_MOVES = 64;
export const RELAYS = [6, 9] as const;
export type Edge = { from: number; to: number; cost: number };
export type Board = { day: string; edges: Edge[] };
export type Replay = { path: number[]; cost: number; complete: boolean; relays: number };
export type LocalRun = { id: string; name: string; day: string; path: number[]; recordedAt: number };
export type RankedRun = LocalRun & { cost: number; score: number };

export function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function validDay(day: unknown): day is string {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)
    && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
}

export function createBoard(day: string): Board {
  if (!validDay(day)) throw new Error('Invalid puzzle date.');
  let seed = 2166136261;
  for (const char of `${RULES_VERSION}:${day}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const weight = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return 1 + (seed >>> 16) % 9;
  };
  const edges: Edge[] = [];
  for (let node = 0; node < 16; node++) {
    if (node % 4 < 3) edges.push({ from: node, to: node + 1, cost: weight() });
    if (node < 12) edges.push({ from: node, to: node + 4, cost: weight() });
  }
  return { day, edges };
}

export function neighbors(board: Board, node: number): { node: number; cost: number }[] {
  return board.edges.flatMap(edge => edge.from === node ? [{ node: edge.to, cost: edge.cost }]
    : edge.to === node ? [{ node: edge.from, cost: edge.cost }] : []);
}

export function nodeLabel(node: number): string {
  return `${'ABCD'[node % 4]}${Math.floor(node / 4) + 1}`;
}

/** Throws for malformed, illegal or post-finish moves; accepts unfinished routes for the UI. */
export function inspectReplay(board: Board, input: unknown): Replay {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_MOVES + 1
    || input[0] !== 0 || input.some(node => !Number.isInteger(node) || node < 0 || node > 15)) {
    throw new Error('Route must start at TX and contain at most 64 connected moves.');
  }
  let cost = 0;
  let relays = 0;
  for (let index = 1; index < input.length; index++) {
    if (input[index - 1] === 15) throw new Error('The route already reached RX.');
    const edge = neighbors(board, input[index - 1]).find(next => next.node === input[index]);
    if (!edge) throw new Error('Choose a directly connected node.');
    cost += edge.cost;
    if (input[index] === RELAYS[0]) relays |= 1;
    if (input[index] === RELAYS[1]) relays |= 2;
    if (input[index] === 15 && relays !== 3) throw new Error('Collect both relays before reaching RX.');
  }
  return { path: [...input], cost, relays, complete: input.at(-1) === 15 };
}

/** Dijkstra over (node, collected-relay mask), not just node: revisits can be optimal. */
export function optimalRoute(board: Board): { path: number[]; cost: number } {
  const distance = Array<number>(64).fill(Infinity);
  const previous = Array<number>(64).fill(-1);
  const visited = new Set<number>();
  distance[0] = 0;
  for (let step = 0; step < 64; step++) {
    let state = -1;
    for (let candidate = 0; candidate < 64; candidate++) {
      if (!visited.has(candidate) && (state < 0 || distance[candidate] < distance[state])) state = candidate;
    }
    if (state < 0 || !Number.isFinite(distance[state])) break;
    if (state === 63) {
      const path: number[] = [];
      for (let cursor = state; cursor !== -1; cursor = previous[cursor]) path.unshift(cursor % 16);
      return { path, cost: distance[state] };
    }
    visited.add(state);
    const node = state % 16;
    const mask = Math.floor(state / 16);
    for (const next of neighbors(board, node)) {
      const nextMask = mask | (next.node === RELAYS[0] ? 1 : 0) | (next.node === RELAYS[1] ? 2 : 0);
      if (next.node === 15 && nextMask !== 3) continue;
      const nextState = nextMask * 16 + next.node;
      if (distance[state] + next.cost < distance[nextState]) {
        distance[nextState] = distance[state] + next.cost;
        previous[nextState] = state;
      }
    }
  }
  throw new Error('Puzzle has no solution.');
}

export function scoreReplay(board: Board, input: unknown): { cost: number; score: number } {
  const replay = inspectReplay(board, input);
  if (!replay.complete) throw new Error('Finish the route before saving it.');
  const optimum = optimalRoute(board).cost;
  return { cost: replay.cost, score: Math.max(0, 1000 - 20 * (replay.cost - optimum)) };
}

export function normalizeName(input: unknown): string {
  if (typeof input !== 'string') throw new Error('Use a callsign of 3–12 letters or numbers.');
  const name = input.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,12}$/.test(name)) throw new Error('Use a callsign of 3–12 letters or numbers.');
  return name;
}

/**
 * A word filter for the public board. Short on purpose: it catches the
 * obvious and the obvious spelled with digits, and reserves the generated
 * ROUTE- aliases and the site owner's name so nobody can pass as either.
 * Anything it misses can be removed from the database by hand.
 */
const BLOCKED = ['FUCK', 'SHIT', 'CUNT', 'BITCH', 'NIGG', 'FAG', 'RAPE', 'NAZI', 'HITLER', 'WHORE', 'SLUT', 'DICK', 'COCK', 'PUSSY', 'PENIS', 'VAGIN', 'ASSHOLE', 'KKK', 'PORN', 'TWAT', 'WANK', 'RETARD'];
const RESERVED = ['ROUTE', 'ADMIN', 'MEHDI', 'ACHO'];
const LEET: Record<string, string> = { '0': 'O', '1': 'I', '3': 'E', '4': 'A', '5': 'S', '7': 'T', '8': 'B' };

/** A callsign that may appear publicly, or an error saying why not. */
export function publicCallsign(input: unknown): string {
  const name = normalizeName(input);
  const plain = name.replace(/[0-9]/g, digit => LEET[digit] ?? digit);
  if (BLOCKED.some(word => plain.includes(word)) || RESERVED.some(word => plain.startsWith(word)))
    throw new Error('Pick a different callsign for the public board.');
  return name;
}

/** Standard competition ranking: equal costs share a place, so 1, 1, 3. */
export function sharedRanks(costs: number[]): number[] {
  return costs.map(cost => 1 + costs.filter(other => other < cost).length);
}

/** Stored scores are never authoritative, even locally: rederive them from the route. */
export function readLocalRuns(raw: string | null): LocalRun[] {
  if (!raw) return [];
  if (raw.length > 100_000) throw new Error('Stored leaderboard is too large.');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Stored leaderboard is invalid.');
  const runs: LocalRun[] = [];
  for (const item of parsed.slice(0, 50)) {
    try {
      if (!item || typeof item.id !== 'string' || item.id.length > 80 || !validDay(item.day)
        || !Number.isSafeInteger(item.recordedAt) || item.recordedAt < 0) continue;
      const name = normalizeName(item.name);
      const board = createBoard(item.day);
      scoreReplay(board, item.path);
      runs.push({ id: item.id, name, day: item.day, path: [...item.path], recordedAt: item.recordedAt });
    } catch { /* A single corrupt entry must not hide the remaining valid runs. */ }
  }
  return runs;
}

export function rankLocalRuns(runs: LocalRun[], day: string): RankedRun[] {
  const board = createBoard(day);
  const best = new Map<string, RankedRun>();
  for (const run of runs.filter(item => item.day === day)) {
    const candidate = { ...run, ...scoreReplay(board, run.path) };
    const existing = best.get(run.name);
    if (!existing || candidate.cost < existing.cost
      || (candidate.cost === existing.cost && candidate.recordedAt < existing.recordedAt)) best.set(run.name, candidate);
  }
  return [...best.values()].sort((a, b) => a.cost - b.cost || a.recordedAt - b.recordedAt || a.id.localeCompare(b.id)).slice(0, 10);
}

export function mergeLocalRun(runs: LocalRun[], run: LocalRun): LocalRun[] {
  const existing = runs.find(item => item.day === run.day && item.name === run.name);
  if (existing && scoreReplay(createBoard(run.day), existing.path).cost <= scoreReplay(createBoard(run.day), run.path).cost) return runs;
  return [run, ...runs.filter(item => item.id !== run.id && !(item.day === run.day && item.name === run.name))].slice(0, 50);
}
