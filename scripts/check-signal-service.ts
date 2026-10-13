import assert from 'node:assert/strict';
import { createBoard, optimalRoute, RULES_VERSION, utcDay } from '../lib/signal-game';

const base = 'http://127.0.0.1:8788';
const day = utcDay(), best = optimalRoute(createBoard(day));
const player = crypto.randomUUID();
const post = (body: unknown, extra: Record<string,string> = {}) => fetch(base + '/runs', { method: 'POST', headers: { 'Content-Type':'application/json', Origin:'http://127.0.0.1:4173', ...extra }, body: JSON.stringify(body) });
const data = { player, day, version: RULES_VERSION, path:best.path };
assert.equal((await post({ ...data, path:[0,15], score:999999 })).status,400);
assert.equal((await post({ ...data, day:'2000-01-01' })).status,400);
assert.equal((await post({ ...data, player:'invalid' })).status,400);
assert.equal((await post(data, {Origin:'https://not-allowed.example'})).status,403);
assert.equal((await post({ ...data, junk:'x'.repeat(5000) })).status,400);
const first = await post({...data, score:999999}); assert.equal(first.status,200);
const saved = await first.json(); assert.equal(saved.score,1000); assert.equal(saved.cost,best.cost);
const second = await post({...data,path:[0,1,0,...best.path.slice(1)]}); assert.equal(second.status,200);
const response = await fetch(base+'/leaderboard?day='+day,{headers:{Origin:'http://127.0.0.1:4173'}});
assert.equal(response.headers.get('access-control-allow-origin'),'http://127.0.0.1:4173');
const board = await response.json(); const entries=board.runs.filter((r:{alias:string})=>r.alias===saved.alias);
assert.equal(entries.length,1); assert.equal(entries[0].cost,best.cost);
assert(!JSON.stringify(board).includes(player), 'Browser identifier must not be public');
// Use a separate local-only address bucket, then check the exact quota boundary.
const quotaAddress = `2001:db8:${crypto.randomUUID().slice(0,4)}::1`;
for (let i=0;i<30;i++) assert.equal((await post({...data,player:crypto.randomUUID(),path:[0,15]}, {'CF-Connecting-IP':quotaAddress})).status,400);
assert.equal((await post(data, {'CF-Connecting-IP':quotaAddress})).status,429);
console.log('PASS: local D1 service rejects invalid/oversized/stale routes, enforces CORS and quota, recomputes scores, preserves best results, and hides identifiers.');
console.log('Temporary local test alias: '+saved.alias);
