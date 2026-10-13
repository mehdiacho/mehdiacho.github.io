import { createBoard, publicCallsign, scoreReplay, utcDay, validDay, RULES_VERSION } from '../../lib/signal-game';

const hash = async (value: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(b => b.toString(16).padStart(2, '0')).join('');

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Send JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing route.');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) { await reader.cancel(); throw new Error('Route is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid route.');
  return value as Record<string, unknown>;
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
      const today = utcDay();
      if (request.method === 'GET' && url.pathname === '/leaderboard') {
        const day = url.searchParams.get('day') || today;
        if (!validDay(day) || day > today || Date.parse(today) - Date.parse(day) > 30 * 86400000) return reply({ error: 'Choose a puzzle from the last 30 days.' }, 400);
        const { results } = await env.SIGNAL_DB.prepare('SELECT alias, cost, score, recorded_at AS recordedAt FROM runs WHERE day = ? ORDER BY cost ASC, recorded_at ASC, player ASC LIMIT 10').bind(day).all();
        // Equal costs share a place, so the board says how many share the top
        // one instead of rewarding whoever played closest to midnight UTC.
        const top = await env.SIGNAL_DB.prepare('SELECT COUNT(*) AS tied FROM runs WHERE day = ? AND cost = (SELECT MIN(cost) FROM runs WHERE day = ?)').bind(day, day).first<{ tied: number }>();
        return reply({ day, version: RULES_VERSION, runs: results, tiedForFirst: top?.tied ?? 0 });
      }
      if (request.method !== 'POST' || url.pathname !== '/runs') return reply({ error: 'Not found.' }, 404);
      // Count attempts before parsing or solving. The edge overwrites CF-Connecting-IP.
      const hour = Math.floor(Date.now() / 3600000);
      const bucket = await hash(`${hour}:${request.headers.get('CF-Connecting-IP') || 'local'}`);
      const quota = await env.SIGNAL_DB.prepare('INSERT INTO limits(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket, (hour + 2) * 3600000).first<{ count: number }>();
      if (!quota || quota.count > 30) { headers.set('Retry-After', '3600'); return reply({ error: 'Too many submissions. Try again in an hour.' }, 429); }
      let body: Record<string, unknown>;
      try { body = await readBody(request); } catch { return reply({ error: 'Send a valid JSON route under 4 KB.' }, 400); }
      if (body.day !== today || body.version !== RULES_VERSION) return reply({ error: 'Restart with today’s puzzle before publishing.' }, 400);
      if (typeof body.player !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.player)) return reply({ error: 'Invalid player identifier.' }, 400);
      let result: { cost: number; score: number };
      try { result = scoreReplay(createBoard(today), body.path); } catch { return reply({ error: 'That route does not complete the circuit.' }, 400); }
      let callsign: string | undefined;
      if (body.name !== undefined) {
        try { callsign = publicCallsign(body.name); } catch (error) { return reply({ error: (error as Error).message }, 400); }
      }
      const player = await hash(body.player);
      // A filtered 3–12 character callsign if the player chose one; otherwise a
      // generated alias, so publishing never requires a name.
      const alias = callsign ?? `ROUTE-${player.slice(0, 8).toUpperCase()}`;
      await env.SIGNAL_DB.prepare('INSERT INTO runs(day,player,alias,cost,score,recorded_at) VALUES(?,?,?,?,?,?) ON CONFLICT(day,player) DO UPDATE SET alias=excluded.alias,score=CASE WHEN excluded.cost < runs.cost THEN excluded.score ELSE runs.score END,recorded_at=CASE WHEN excluded.cost < runs.cost THEN excluded.recorded_at ELSE runs.recorded_at END,cost=MIN(excluded.cost,runs.cost)').bind(today, player, alias, result.cost, result.score, Date.now()).run();
      return reply({ alias, ...result });
    } catch {
      console.error(JSON.stringify({ event: 'signal_backend_failure' }));
      return reply({ error: 'Rankings are temporarily unavailable. Your local result is still safe.' }, 503);
    }
  },
  async scheduled(_event, env) {
    await env.SIGNAL_DB.batch([
      env.SIGNAL_DB.prepare('DELETE FROM limits WHERE expires < ?').bind(Date.now()),
      env.SIGNAL_DB.prepare('DELETE FROM runs WHERE day < ?').bind(utcDay(new Date(Date.now() - 30 * 86400000))),
    ]);
  },
} satisfies ExportedHandler<Env>;
