import assert from 'node:assert/strict';
import { createBoard, inspectReplay, optimalRoute, scoreReplay, readLocalRuns, mergeLocalRun, rankLocalRuns, normalizeName, validDay } from '../lib/signal-game';

// An independent relaxation solver checks the relay-state shortest-path solver.
function referenceCost(day: string) {
  const board = createBoard(day);
  const costs = Array(64).fill(Infinity); costs[0] = 0;
  for (let pass = 0; pass < 63; pass++) {
    for (const edge of board.edges) for (const [from, to] of [[edge.from, edge.to], [edge.to, edge.from]]) {
      if (from === 15) continue;
      for (let mask = 0; mask < 4; mask++) {
        const next = mask | (to === 6 ? 1 : 0) | (to === 9 ? 2 : 0);
        if (to === 15 && next !== 3) continue;
        costs[next * 16 + to] = Math.min(costs[next * 16 + to], costs[mask * 16 + from] + edge.cost);
      }
    }
  }
  return costs[63];
}
for (let i = 0; i < 120; i++) {
  const day = new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10);
  const board = createBoard(day), best = optimalRoute(board);
  assert.deepEqual(createBoard(day), board);
  assert.equal(best.cost, referenceCost(day));
  assert.equal(inspectReplay(board, best.path).complete, true);
  assert.equal(scoreReplay(board, best.path).score, 1000);
}
const day = '2026-10-13', board = createBoard(day), best = optimalRoute(board);
assert.throws(() => inspectReplay(board, [0,15]));
assert.throws(() => inspectReplay(board, [0,1,2,3,7,11,15]));
assert.throws(() => inspectReplay(board, [...best.path, 11]));
assert.throws(() => inspectReplay(board, [0,1.5]));
assert.throws(() => scoreReplay(board, [0]));
assert.throws(() => normalizeName('<script>'));
assert.equal(validDay('2026-02-30'), false);
const run = { id:'one', name:'TEST', day, path:best.path, recordedAt:1 };
const worse = { ...run, id:'two', path:[0,1,0,...best.path.slice(1)], recordedAt:2 };
assert.deepEqual(mergeLocalRun([run], worse), [run]);
assert.equal(rankLocalRuns([run,worse],day).length, 1);
assert.equal(readLocalRuns(JSON.stringify([{...run,path:[0,15]},run])).length,1);
assert.throws(() => readLocalRuns('{bad'));
assert.equal(rankLocalRuns(readLocalRuns(JSON.stringify([{...run,score:900000}])),day)[0].score,1000);
console.log('PASS: 120 daily boards independently solved; illegal replays, missing relays, post-finish moves, dates, storage corruption and ranking validated.');
