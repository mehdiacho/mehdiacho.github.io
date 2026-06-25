/**
 * SECURE_VAULT — Cloudflare Worker backend.
 *
 * Stores only ciphertext + IV (the encryption happens in the browser; see
 * lib/vault-crypto.ts). Enforces a per-secret access count and leans on KV's
 * native TTL for time-based expiry. Burn-after-read: the record is deleted once
 * its views are exhausted.
 *
 * Endpoints (all JSON):
 *   POST /api/secrets       create  { id, ct, iv, maxViews, ttlHours, contentType, size }
 *   POST /api/secrets/get   redeem  { id }  -> { ct, iv, contentType, remaining }
 */

export interface Env {
  VAULT: KVNamespace;
}

interface VaultRecord {
  ct: string;
  iv: string;
  maxViews: number;
  views: number;
  contentType: string;
  size: number;
  createdAt: number;
  expiresAt: number;
}

const ALLOWED_ORIGINS = new Set([
  'https://mehdiacho.tech',
  'https://www.mehdiacho.tech',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

// base64 of ~256 KB of plaintext; generous for env files, caps abuse.
const MAX_CT_CHARS = 360_000;
const KV_MIN_TTL = 60; // Cloudflare KV minimum expirationTtl (seconds).

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://mehdiacho.tech';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  });
}

const isId = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin');
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    const url = new URL(req.url);
    try {
      if (req.method === 'POST' && url.pathname === '/api/secrets') {
        return await create(req, env, origin);
      }
      if (req.method === 'POST' && url.pathname === '/api/secrets/get') {
        return await open(req, env, origin);
      }
      return json({ error: 'not_found' }, 404, origin);
    } catch {
      return json({ error: 'bad_request' }, 400, origin);
    }
  },
};

async function create(req: Request, env: Env, origin: string | null): Promise<Response> {
  const body = (await req.json()) as Partial<VaultRecord> & { id?: unknown; ttlHours?: unknown; maxViews?: unknown };
  const { id, ct, iv, contentType } = body as { id: unknown; ct: unknown; iv: unknown; contentType: unknown };

  if (!isId(id)) return json({ error: 'bad_id' }, 400, origin);
  if (typeof ct !== 'string' || typeof iv !== 'string' || ct.length === 0) {
    return json({ error: 'bad_payload' }, 400, origin);
  }
  if (ct.length > MAX_CT_CHARS) return json({ error: 'too_large' }, 413, origin);

  const maxViews = Math.floor(Number((body as { maxViews: unknown }).maxViews));
  if (!(maxViews >= 1 && maxViews <= 100)) return json({ error: 'bad_max_views' }, 400, origin);

  const ttlHours = Math.floor(Number((body as { ttlHours: unknown }).ttlHours));
  if (!(ttlHours >= 1 && ttlHours <= 168)) return json({ error: 'bad_ttl' }, 400, origin);

  if (await env.VAULT.get(id)) return json({ error: 'id_exists' }, 409, origin);

  const now = Date.now();
  const record: VaultRecord = {
    ct,
    iv,
    maxViews,
    views: 0,
    contentType: typeof contentType === 'string' ? contentType : 'files',
    size: Number((body as { size: unknown }).size) || 0,
    createdAt: now,
    expiresAt: now + ttlHours * 3600 * 1000,
  };
  await env.VAULT.put(id, JSON.stringify(record), { expirationTtl: ttlHours * 3600 });
  return json({ ok: true }, 200, origin);
}

async function open(req: Request, env: Env, origin: string | null): Promise<Response> {
  const { id } = (await req.json()) as { id: unknown };
  if (!isId(id)) return json({ error: 'bad_id' }, 400, origin);

  const raw = await env.VAULT.get(id);
  if (!raw) return json({ error: 'not_found_or_expired' }, 404, origin);

  const record = JSON.parse(raw) as VaultRecord;
  const now = Date.now();

  // Defensive expiry check (KV TTL should already have removed it).
  if (now >= record.expiresAt) {
    await env.VAULT.delete(id);
    return json({ error: 'not_found_or_expired' }, 404, origin);
  }
  if (record.views >= record.maxViews) {
    await env.VAULT.delete(id);
    return json({ error: 'exhausted' }, 410, origin);
  }

  record.views += 1;
  const remaining = record.maxViews - record.views;

  if (remaining <= 0) {
    // Burn-after-read: last permitted view, delete immediately.
    await env.VAULT.delete(id);
  } else {
    // Re-store with the ORIGINAL absolute expiry preserved (KV can't report
    // the remaining TTL, so recompute it from expiresAt).
    const ttl = Math.max(KV_MIN_TTL, Math.ceil((record.expiresAt - now) / 1000));
    await env.VAULT.put(id, JSON.stringify(record), { expirationTtl: ttl });
  }

  return json({ ct: record.ct, iv: record.iv, contentType: record.contentType, remaining }, 200, origin);
}
