/**
 * SECURE_VAULT — client for the Cloudflare Worker backend.
 *
 * The Worker only ever stores ciphertext + IV, enforces the access-count, and
 * relies on KV's native TTL for expiry. The base URL is public, so (mirroring
 * lib/firebase.ts) we bake in a default and let a VITE_VAULT_API_URL env var
 * override it. This keeps the GitHub Pages build working without CI secrets.
 */

// Set after the first `wrangler deploy` (its *.workers.dev URL).
const DEFAULT_VAULT_API = 'https://mehdi-vault.mehdiacho.workers.dev';

const API = (import.meta.env.VITE_VAULT_API_URL ?? DEFAULT_VAULT_API).replace(/\/+$/, '');

export interface CreateInput {
  id: string;
  ct: string;
  iv: string;
  maxViews: number;
  ttlHours: number;
  contentType: 'files' | 'text' | 'mixed';
  size: number;
}

export interface OpenResult {
  ct: string;
  iv: string;
  contentType: string;
  remaining: number;
}

async function errorFrom(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    /* ignore */
  }
  return `http_${res.status}`;
}

export async function createSecret(input: CreateInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/secrets`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('network_error');
  }
  if (!res.ok) throw new Error(await errorFrom(res));
}

export async function openSecret(id: string): Promise<OpenResult> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/secrets/get`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch {
    throw new Error('network_error');
  }
  if (!res.ok) throw new Error(await errorFrom(res));
  return (await res.json()) as OpenResult;
}
