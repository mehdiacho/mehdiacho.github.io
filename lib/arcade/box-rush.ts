/**
 * Box Rush: you are the object detector. Drones, birds and the odd rare
 * satellite cross the frame; box the drones before they leave it.
 *
 * Everything here is integer arithmetic on a fixed seed, so the browser and
 * the leaderboard worker replay a run to exactly the same score. The client
 * calls the same `createRound` live that the worker calls on the submitted
 * boxes, so there is one scoring path, not two that might drift.
 */
export const BOX_RUSH_VERSION = 'box-rush-v1';
export const FIELD_W = 1000;
export const FIELD_H = 625;
export const DURATION = 60_000;
/** Boxes closer together than this are rejected, which also caps a run at 400 boxes. */
export const MIN_GAP = 150;
export const MAX_BOXES = DURATION / MIN_GAP;
export const MIN_SIDE = 8;

export type Kind = 'drone' | 'bird' | 'rare';
export type Thing = {
  id: number; kind: Kind; spawn: number; despawn: number; natural: boolean;
  x0: number; y0: number; vx: number; vy: number; w: number; h: number; amp: number; period: number;
};
/** [time ms since start, x0, y0, x1, y1] in field units. */
export type Box = [number, number, number, number, number];
export type Rect = { x: number; y: number; w: number; h: number };
export type Outcome =
  | { type: 'hit'; thing: Thing; iou: number; points: number; multiplier: number; rect: Rect }
  | { type: 'decoy'; thing: Thing; iou: number; points: number; rect: Rect }
  | { type: 'empty'; points: number };
export type Summary = {
  score: number; hits: number; decoys: number; empties: number; escaped: number;
  bestCombo: number; meanIou: number; precision: number; recall: number;
};

function rng(seedText: string) {
  let seed = 2166136261;
  for (const char of seedText) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  return (min: number, max: number) => {
    // mulberry32: integer-only, so every engine produces the same sequence.
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const value = ((t ^ (t >>> 14)) >>> 0) % (max - min + 1);
    return min + value;
  };
}

/** The week's sky: the same for every player, all week. */
export function createSky(week: string): Thing[] {
  const random = rng(`${BOX_RUSH_VERSION}:${week}`);
  const things: Thing[] = [];
  let time = 700;
  while (time < DURATION - 1800) {
    const progress = Math.floor(time * 100 / DURATION); // 0..100, drives the difficulty ramp
    const roll = random(1, 100);
    const kind: Kind = roll <= 6 ? 'rare' : roll <= 30 + Math.floor(progress / 6) ? 'bird' : 'drone';
    const w = kind === 'rare' ? random(42, 54) : kind === 'bird' ? random(62, 92) : random(70, 112);
    const h = kind === 'rare' ? w : Math.floor(w * (kind === 'bird' ? 55 : 62) / 100);
    const speed = (kind === 'rare' ? 330 : 150) + random(0, 70) + progress * 2;
    const fromLeft = random(0, 1) === 0;
    const vx = fromLeft ? speed : -speed;
    const x0 = fromLeft ? -w : FIELD_W;
    const y0 = random(24, FIELD_H - h - 24);
    const vy = random(-36, 36);
    const amp = kind === 'drone' ? random(0, 26) : kind === 'bird' ? random(12, 38) : random(4, 10);
    const period = kind === 'bird' ? random(600, 900) : random(900, 1700);
    const travel = Math.ceil((FIELD_W + w) * 1000 / speed);
    const natural = time + travel <= DURATION;
    things.push({ id: things.length, kind, spawn: time, despawn: natural ? time + travel : DURATION + 1, natural, x0, y0, vx, vy, w, h, amp, period });
    time += Math.max(330, 1150 - progress * 7) + random(-180, 180);
  }
  return things;
}

/** Where a thing is at time t, or null when it is out of frame. */
export function locate(thing: Thing, t: number): Rect | null {
  if (t < thing.spawn || t >= thing.despawn) return null;
  const dt = t - thing.spawn;
  const x = thing.x0 + Math.trunc(thing.vx * dt / 1000);
  // An integer triangle wave: a bob without Math.sin, which engines may round differently.
  const quarter = Math.floor((dt % thing.period) * 4 * thing.amp / thing.period);
  const bob = quarter < 2 * thing.amp ? quarter - thing.amp : 3 * thing.amp - quarter;
  const y = Math.min(FIELD_H - thing.h, Math.max(0, thing.y0 + Math.trunc(thing.vy * dt / 1000) + bob));
  return { x, y, w: thing.w, h: thing.h };
}

function overlap(a: Rect, b: Rect): { inter: number; union: number } {
  const w = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const h = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = w * h;
  return { inter, union: a.w * a.h + b.w * b.h - inter };
}

/** IoU in hundredths, rounded down. */
export const iouPercent = (a: Rect, b: Rect) => { const { inter, union } = overlap(a, b); return union ? Math.floor(inter * 100 / union) : 0; };

/** Visible part of a rect, so a box drawn at the frame edge is scored against what the player could see. */
const clip = (r: Rect): Rect => {
  const x = Math.max(0, r.x); const y = Math.max(0, r.y);
  return { x, y, w: Math.max(0, Math.min(FIELD_W, r.x + r.w) - x), h: Math.max(0, Math.min(FIELD_H, r.y + r.h) - y) };
};

export function boxRect(box: Box): Rect {
  const [, ax, ay, bx, by] = box;
  return { x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay) };
}

/** Best live match for a rect at time t (used for the live IoU readout while dragging). */
export function bestMatch(things: Thing[], gone: Set<number>, rect: Rect, t: number) {
  let best: { thing: Thing; iou: number; rect: Rect; inter: number; union: number } | null = null;
  for (const thing of things) {
    if (gone.has(thing.id)) continue;
    const where = locate(thing, t);
    if (!where) continue;
    const seen = clip(where);
    if (!seen.w || !seen.h) continue;
    const { inter, union } = overlap(rect, seen);
    // Compare inter/union exactly by cross-multiplying, never through floats.
    if (inter && (!best || inter * best.union > best.inter * union)) best = { thing, iou: Math.floor(inter * 100 / union), rect: seen, inter, union };
  }
  return best;
}

export function createRound(week: string) {
  const things = createSky(week);
  const gone = new Set<number>();
  const counted = new Set<number>();
  let score = 0, combo = 0, bestCombo = 0, hits = 0, decoys = 0, empties = 0, escaped = 0, iouSum = 0, last = -MIN_GAP, settled = 0;

  /** Targets that left the frame unboxed break the combo. Idempotent and monotonic in t. */
  function settle(t: number): number {
    let missed = 0;
    for (const thing of things) {
      if (thing.kind === 'bird' || !thing.natural || gone.has(thing.id) || counted.has(thing.id) || thing.despawn > t) continue;
      counted.add(thing.id); escaped++; missed++; combo = 0;
    }
    settled = Math.max(settled, t);
    return missed;
  }

  function apply(box: unknown): Outcome {
    if (!Array.isArray(box) || box.length !== 5 || box.some(value => !Number.isSafeInteger(value))) throw new Error('Malformed box.');
    const [t, ax, ay, bx, by] = box as Box;
    if (t < last + MIN_GAP || t < settled || t > DURATION) throw new Error('Boxes must be in time order and inside the round.');
    if ([ax, bx].some(x => x < 0 || x > FIELD_W) || [ay, by].some(y => y < 0 || y > FIELD_H)) throw new Error('Box is outside the frame.');
    const rect = boxRect(box as Box);
    if (rect.w < MIN_SIDE || rect.h < MIN_SIDE) throw new Error('Box is too small.');
    last = t;
    settle(t);
    const match = bestMatch(things, gone, rect, t);
    if (match && 2 * match.inter >= match.union) {
      gone.add(match.thing.id);
      if (match.thing.kind === 'bird') {
        decoys++; combo = 0; score -= 40;
        return { type: 'decoy', thing: match.thing, iou: match.iou, points: -40, rect: match.rect };
      }
      const multiplier = 1 + Math.min(3, Math.floor(combo / 4));
      const points = match.iou * (match.thing.kind === 'rare' ? 3 : 1) * multiplier;
      hits++; combo++; bestCombo = Math.max(bestCombo, combo); iouSum += match.iou; score += points;
      return { type: 'hit', thing: match.thing, iou: match.iou, points, multiplier, rect: match.rect };
    }
    empties++; combo = 0; score -= 10;
    return { type: 'empty', points: -10 };
  }

  function summary(): Summary {
    const predicted = hits + decoys + empties;
    return {
      score: Math.max(0, score), hits, decoys, empties, escaped, bestCombo,
      meanIou: hits ? Math.floor(iouSum / hits) : 0,
      precision: predicted ? Math.floor(hits * 100 / predicted) : 0,
      recall: hits + escaped ? Math.floor(hits * 100 / (hits + escaped)) : 0,
    };
  }

  return {
    things, gone, settle, apply, summary,
    get score() { return Math.max(0, score); },
    get combo() { return combo; },
    get multiplier() { return 1 + Math.min(3, Math.floor(combo / 4)); },
  };
}

/** The verifier: replays submitted boxes. Throws on anything a real round could not produce. */
export function scoreBoxRush(week: string, replay: unknown): { score: number; detail: Summary } {
  if (!Array.isArray(replay) || replay.length > MAX_BOXES) throw new Error('Invalid run.');
  const round = createRound(week);
  for (const box of replay) round.apply(box);
  round.settle(DURATION);
  const detail = round.summary();
  return { score: detail.score, detail };
}
