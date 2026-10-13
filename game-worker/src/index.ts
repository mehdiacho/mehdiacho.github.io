import { publicCallsign } from '../../lib/arcade/callsign';
import { gameForWeek, GAMES } from '../../lib/arcade/registry';
import { previousWeek, validWeek, weekOf, weekStart } from '../../lib/arcade/week';

const hash = async (value: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(b => b.toString(16).padStart(2, '0')).join('');
/** A run that ends just after midnight on Sunday still counts for the week it started in. */
const GRACE_MS = 5 * 60_000;
const KEEP_WEEKS = 5;

async function readBody(request: Request, limit: number): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Send JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing run.');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new Error('Run is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid run.');
  return value as Record<string, unknown>;
}

/**
 * Writes the top score of every finished week into the hall of fame. Idempotent,
 * so both the cron and a hall-of-fame read can call it. Equal top scores are all
 * champions (up to five), so nobody wins by playing first.
 */
async function crownChampions(db: D1Database, current: string) {
  const { results } = await db.prepare('SELECT DISTINCT week FROM scores WHERE week < ? AND week NOT IN (SELECT week FROM champions)').bind(current).all<{ week: string }>();
  for (const { week } of results) {
    await db.prepare('INSERT OR IGNORE INTO champions(week,game,alias,score,recorded_at) SELECT week,game,alias,score,recorded_at FROM scores WHERE week = ? AND score > 0 AND score = (SELECT MAX(score) FROM scores WHERE week = ?) ORDER BY recorded_at LIMIT 5').bind(week, week).run();
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGINS.split(',').includes(origin);
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin' });
    if (allowed) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !allowed) return reply({ error: 'Origin is not allowed.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    try {
      const now = Date.now();
      const current = weekOf(new Date(now));
      if (request.method === 'GET' && url.pathname === '/leaderboard') {
        const week = url.searchParams.get('week') || current;
        if (!validWeek(week) || week > current || weekStart(current) - weekStart(week) > KEEP_WEEKS * 7 * 86_400_000) return reply({ error: 'Choose one of the last few weeks.' }, 400);
        const { results } = await env.SIGNAL_DB.prepare('SELECT alias, score, recorded_at AS recordedAt FROM scores WHERE week = ? ORDER BY score DESC, recorded_at ASC, player ASC LIMIT 10').bind(week).all();
        const top = await env.SIGNAL_DB.prepare('SELECT COUNT(*) AS tied FROM scores WHERE week = ? AND score > 0 AND score = (SELECT MAX(score) FROM scores WHERE week = ?)').bind(week, week).first<{ tied: number }>();
        return reply({ week, game: gameForWeek(week).id, scores: results, tiedForFirst: top?.tied ?? 0 });
      }
      if (request.method === 'GET' && url.pathname === '/champions') {
        await crownChampions(env.SIGNAL_DB, current);
        const { results } = await env.SIGNAL_DB.prepare('SELECT week, game, alias, score FROM champions ORDER BY week DESC, recorded_at ASC LIMIT 200').all();
        return reply({ champions: results });
      }
      if (request.method !== 'POST' || url.pathname !== '/runs') return reply({ error: 'Not found.' }, 404);
      // Count attempts before parsing or scoring. The edge overwrites CF-Connecting-IP.
      const hour = Math.floor(now / 3600000);
      const bucket = await hash(`${hour}:${request.headers.get('CF-Connecting-IP') || 'local'}`);
      const quota = await env.SIGNAL_DB.prepare('INSERT INTO limits(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket, (hour + 2) * 3600000).first<{ count: number }>();
      if (!quota || quota.count > 30) { headers.set('Retry-After', '3600'); return reply({ error: 'Too many submissions. Try again in an hour.' }, 429); }
      const largest = Math.max(...Object.values(GAMES).map(game => game.maxBytes));
      let body: Record<string, unknown>;
      try { body = await readBody(request, largest); } catch { return reply({ error: 'Send a valid JSON run.' }, 400); }
      const week = body.week;
      const open = week === current || (week === previousWeek(current) && now - weekStart(current) < GRACE_MS);
      if (typeof week !== 'string' || !open) return reply({ error: 'That week has closed. Play this week’s game to get on the board.' }, 400);
      const game = gameForWeek(week);
      if (body.game !== game.id || body.version !== game.version) return reply({ error: 'The game was updated. Reload the page and play again.' }, 400);
      if (JSON.stringify(body.replay ?? null).length > game.maxBytes) return reply({ error: 'Run is too large.' }, 400);
      if (typeof body.player !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.player)) return reply({ error: 'Invalid player identifier.' }, 400);
      let score: number;
      try { score = game.score(week, body.replay).score; } catch { return reply({ error: 'That run could not be replayed.' }, 400); }
      let callsign: string | undefined;
      if (body.name !== undefined) {
        try { callsign = publicCallsign(body.name); } catch (error) { return reply({ error: (error as Error).message }, 400); }
      }
      const player = await hash(body.player);
      const alias = callsign ?? `PLAYER-${player.slice(0, 6).toUpperCase()}`;
      await env.SIGNAL_DB.prepare('INSERT INTO scores(week,game,player,alias,score,recorded_at) VALUES(?,?,?,?,?,?) ON CONFLICT(week,player) DO UPDATE SET alias=excluded.alias,recorded_at=CASE WHEN excluded.score > scores.score THEN excluded.recorded_at ELSE scores.recorded_at END,score=MAX(excluded.score,scores.score)').bind(week, game.id, player, alias, score, now).run();
      const best = await env.SIGNAL_DB.prepare('SELECT score, (SELECT COUNT(*) FROM scores s WHERE s.week = scores.week AND s.score > scores.score) + 1 AS place FROM scores WHERE week = ? AND player = ?').bind(week, player).first<{ score: number; place: number }>();
      return reply({ alias, score, best: best?.score ?? score, place: best?.place });
    } catch {
      console.error(JSON.stringify({ event: 'arcade_backend_failure' }));
      return reply({ error: 'The scoreboard is temporarily unavailable. Your score on this page is still yours.' }, 503);
    }
  },
  async scheduled(_event, env) {
    const now = Date.now();
    const current = weekOf(new Date(now));
    await crownChampions(env.SIGNAL_DB, current);
    // Champions are kept (crowned just above); weekly scores go after five weeks, rate buckets after two hours.
    let oldest = current;
    for (let i = 0; i < KEEP_WEEKS; i++) oldest = previousWeek(oldest);
    await env.SIGNAL_DB.batch([
      env.SIGNAL_DB.prepare('DELETE FROM limits WHERE expires < ?').bind(now),
      env.SIGNAL_DB.prepare('DELETE FROM scores WHERE week < ?').bind(oldest),
      // Results from the retired daily puzzle keep their promised 30 days, then go.
      env.SIGNAL_DB.prepare('DELETE FROM runs WHERE day < ?').bind(new Date(now - 30 * 86_400_000).toISOString().slice(0, 10)),
    ]);
  },
} satisfies ExportedHandler<Env>;
