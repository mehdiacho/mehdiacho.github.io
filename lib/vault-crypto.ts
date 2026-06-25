/**
 * SECURE_VAULT — zero-knowledge client-side crypto.
 *
 * The whole security model lives here. A random "token" is the ONLY secret.
 * From it we derive:
 *   - a public lookup `id`  (sent to the Worker, safe to store)
 *   - a private AES-GCM key (derived locally, NEVER sent anywhere)
 *
 * The token travels to the recipient only as the typeable code or inside the
 * link's URL hash fragment (`#vault=<token>`), which browsers never transmit to
 * a server. So the Worker (and its operator) only ever sees ciphertext + IV and
 * can never read the secrets. Wrong token => AES-GCM decrypt throws.
 *
 * Uses the WebCrypto API only — no dependencies.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

// Crockford base32 alphabet (excludes I, L, O, U to avoid ambiguity).
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// ---- low-level encodings ---------------------------------------------------

function bytesToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function hex(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

function b64encode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function b64decode(str: string): Uint8Array {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(buf);
}

// ---- token / code ----------------------------------------------------------

/** Random 120-bit token, encoded as 24 Crockford-base32 chars. */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(15)); // 120 bits
  return bytesToBase32(bytes);
}

/** Pretty-print a token as a grouped code: XXXX-XXXX-XXXX-... */
export function formatCode(token: string): string {
  return token.replace(/(.{4})/g, '$1-').replace(/-+$/, '');
}

/**
 * Accept a raw code, a grouped code, or a full share link, and return the bare
 * canonical token. Maps the visually ambiguous chars a human might type
 * (I/L -> 1, O -> 0) onto the Crockford alphabet.
 */
export function normalizeCode(input: string): string {
  let s = (input || '').trim();
  const marker = 'vault=';
  const idx = s.indexOf(marker);
  if (idx !== -1) s = s.slice(idx + marker.length);
  s = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  s = s.replace(/O/g, '0').replace(/[IL]/g, '1');
  return s;
}

/** Build the share link that carries the token in the (server-invisible) hash. */
export function buildShareLink(token: string): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#vault=${token}`;
}

// ---- key derivation --------------------------------------------------------

/** Public lookup id (32 hex chars) — safe to send to the server. */
export async function deriveId(token: string): Promise<string> {
  const h = await sha256(enc.encode(`${token}|id|v1`));
  return hex(h.slice(0, 16));
}

/** Private AES-GCM-256 key derived from the token. Never leaves the browser. */
export async function deriveKey(token: string): Promise<CryptoKey> {
  const ikm = await crypto.subtle.importKey('raw', enc.encode(token), 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: enc.encode('vault|salt|v1'),
      info: enc.encode('vault|enc|v1'),
    },
    ikm,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ---- payload encryption ----------------------------------------------------

export interface VaultFile {
  name: string;
  /** base64 of the raw file bytes */
  b64: string;
  size: number;
}

export interface VaultManifest {
  files: VaultFile[];
  text?: string;
}

export interface EncryptedBlob {
  ct: string; // base64 ciphertext
  iv: string; // base64 IV
}

export async function encryptManifest(token: string, manifest: VaultManifest): Promise<EncryptedBlob> {
  const key = await deriveKey(token);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = enc.encode(JSON.stringify(manifest));
  const ctBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return { ct: b64encode(new Uint8Array(ctBuf)), iv: b64encode(iv) };
}

export async function decryptManifest(token: string, ct: string, iv: string): Promise<VaultManifest> {
  const key = await deriveKey(token);
  const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64decode(iv) }, key, b64decode(ct));
  return JSON.parse(dec.decode(new Uint8Array(ptBuf))) as VaultManifest;
}

// ---- file helpers (used by the UI) ----------------------------------------

/** Read a File into a base64 string (raw bytes). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      // result is a data URL: "data:...;base64,XXXX" — keep only the payload.
      const comma = result.indexOf(',');
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });
}

/** Decode a base64 string into a Blob for download. */
export function base64ToBlob(b64: string, type = 'application/octet-stream'): Blob {
  return new Blob([b64decode(b64)], { type });
}

/** Best-effort UTF-8 decode of a base64 payload (for previewing text files). */
export function base64ToText(b64: string): string {
  return dec.decode(b64decode(b64));
}
