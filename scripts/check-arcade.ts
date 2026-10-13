/** Determinism and anti-tamper checks for the weekly arcade. Run: npx tsx scripts/check-arcade.ts */
import assert from 'node:assert/strict';
import { createRound, createSky, DURATION, FIELD_H, FIELD_W, locate, MIN_GAP, scoreBoxRush } from '../lib/arcade/box-rush';
import type { Box } from '../lib/arcade/box-rush';
import { gameForWeek } from '../lib/arcade/registry';
import { previousWeek, validWeek, weekOf, weekStart } from '../lib/arcade/week';
import { publicCallsign, sharedRanks } from '../lib/arcade/callsign';

// Weeks
assert.equal(weekOf(new Date('2026-10-13T15:00:00Z')), '2026-W42');
assert.equal(weekOf(new Date('2026-10-12T00:00:00Z')), '2026-W42');
assert.equal(weekOf(new Date('2026-10-11T23:59:59Z')), '2026-W41');
assert.equal(weekOf(new Date('2021-01-03T12:00:00Z')), '2020-W53');
assert.equal(weekOf(new Date('2024-12-30T12:00:00Z')), '2025-W01');
assert.equal(new Date(weekStart('2026-W42')).toISOString(), '2026-10-12T00:00:00.000Z');
assert.equal(previousWeek('2026-W01'), '2025-W52');
assert.ok(validWeek('2020-W53') && validWeek('2026-W53') && !validWeek('2025-W53') && !validWeek('2026-W00') && !validWeek('x'));
for (let day = 0; day < 800; day++) { const w = weekOf(new Date(Date.UTC(2025, 0, 1) + day * 86400000)); assert.equal(weekOf(new Date(weekStart(w))), w); }
assert.equal(gameForWeek('2026-W42').id, 'box-rush');
assert.equal(gameForWeek('2030-W01').id, 'box-rush');

// Sky is deterministic and sane
const sky = createSky('2026-W42');
assert.deepEqual(sky, createSky('2026-W42'));
assert.notDeepEqual(sky, createSky('2026-W43'));
assert.ok(sky.length > 60 && sky.length < 140, `sky has ${sky.length} things`);
for (const thing of sky) for (let t = thing.spawn; t < Math.min(thing.despawn, DURATION); t += 97) {
  const r = locate(thing, t)!; assert.ok(r.y >= 0 && r.y + r.h <= FIELD_H);
}

// A perfect bot: box every target as soon as it is fully in frame.
function perfectRun(week: string, jitter = 0): Box[] {
  const boxes: Box[] = []; let last = -MIN_GAP;
  const targets = createSky(week).filter(t => t.kind !== 'bird');
  for (const thing of targets) {
    for (let t = Math.max(thing.spawn, last + MIN_GAP); t < Math.min(thing.despawn, DURATION); t += 10) {
      const r = locate(thing, t)!;
      if (r.x < 0 || r.x + r.w > FIELD_W) continue;
      boxes.push([t, r.x + jitter, r.y, r.x + r.w, r.y + r.h]); last = t; break;
    }
  }
  return boxes.sort((a, b) => a[0] - b[0]).filter((box, i, all) => i === 0 || box[0] - all[i - 1][0] >= MIN_GAP);
}
const perfect = scoreBoxRush('2026-W42', perfectRun('2026-W42'));
console.log('near-perfect bot on 2026-W42:', perfect.detail);
assert.ok(perfect.detail.hits > 30 && perfect.detail.decoys === 0 && perfect.detail.meanIou >= 95);
assert.deepEqual(scoreBoxRush('2026-W42', perfectRun('2026-W42')), perfect);
const sloppy = scoreBoxRush('2026-W42', perfectRun('2026-W42', 12));
assert.ok(sloppy.score < perfect.score);

// Live play (settling every frame) must equal the replay.
{
  const boxes = perfectRun('2026-W42', 5); const live = createRound('2026-W42'); let i = 0;
  for (let t = 0; t <= DURATION; t += 16) { while (i < boxes.length && boxes[i][0] <= t) live.apply(boxes[i++]); live.settle(t); }
  live.settle(DURATION);
  assert.deepEqual(live.summary(), scoreBoxRush('2026-W42', boxes).detail);
}

// Tampering
const bad: unknown[] = [null, {}, 'x', [[0, 0, 0, 10]], [[0, 0, 0, 100, 100.5]], [[0, -1, 0, 100, 100]], [[0, 0, 0, 1001, 100]],
  [[70000, 0, 0, 100, 100]], [[500, 0, 0, 100, 100], [600, 0, 0, 100, 100]], [[500, 0, 0, 100, 100], [400, 0, 0, 100, 100]],
  [[500, 0, 0, 4, 100]], Array.from({ length: 401 }, (_, i) => [i * 150, 0, 0, 100, 100])];
for (const replay of bad) assert.throws(() => scoreBoxRush('2026-W42', replay), undefined, JSON.stringify(replay)?.slice(0, 60));
assert.equal(scoreBoxRush('2026-W42', []).score, 0);
// Spamming empty boxes never goes below zero.
assert.equal(scoreBoxRush('2026-W42', Array.from({ length: 50 }, (_, i) => [i * 150, 990, 615, 1000, 625])).score >= 0, true);

// Callsigns and ranks
assert.equal(publicCallsign(' ace7 '), 'ACE7');
assert.throws(() => publicCallsign('PLAYER1')); assert.throws(() => publicCallsign('5H1T'));
assert.deepEqual(sharedRanks([900, 900, 500]), [1, 1, 3]);
console.log('arcade checks passed');
