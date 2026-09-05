/**
 * Seeds the `projects` collection in Firestore from the bundled PROJECTS array.
 *
 * The site prefers Firestore and falls back to constants.ts, so the two must
 * start out identical — otherwise the first admin edit would appear to also
 * silently reorder or rename everything else. Run once after enabling
 * Firestore; after that the admin console is the source of truth.
 *
 * Idempotent: documents are keyed by the card id (P01…), so re-running
 * overwrites in place rather than duplicating.
 *
 *   node scripts/seed-firestore.mjs [--dry]
 *
 * Auth comes from `gcloud auth print-access-token`, so it writes as whoever is
 * logged into gcloud — which must be the owner account the rules accept.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const PROJECT = 'mehdi-00';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const DRY = process.argv.includes('--dry');

/** constants.ts is TypeScript; bundle it to ESM so plain node can import it. */
async function loadProjects() {
  const dir = mkdtempSync(join(tmpdir(), 'seed-'));
  const out = join(dir, 'constants.mjs');
  // types.ts is types-only, so stubbing it avoids pulling in the whole app.
  writeFileSync(join(dir, 'shim.ts'), 'export {};');
  await build({
    entryPoints: ['constants.ts'],
    outfile: out,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    plugins: [{
      name: 'stub-types',
      setup(b) {
        b.onResolve({ filter: /\.\/types$/ }, () => ({ path: join(dir, 'shim.ts') }));
      },
    }],
  });
  const mod = await import(pathToFileURL(out).href);
  rmSync(dir, { recursive: true, force: true });
  return mod.PROJECTS;
}

/** JS value -> Firestore REST typed value. */
function val(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v)
    ? { integerValue: String(v) }
    : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(val) } };
  return { mapValue: { fields: fields(v) } };
}

const fields = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined).map(([k, v]) => [k, val(v)]),
  );

// On Windows `gcloud` is a .cmd shim, which execFile can't resolve on its own.
const token = () =>
  execFileSync('gcloud', ['auth', 'print-access-token'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  }).trim();

const projects = await loadProjects();
if (!Array.isArray(projects) || !projects.length) {
  console.error('No PROJECTS found in constants.ts — refusing to seed.');
  process.exit(1);
}

console.log(`${DRY ? '[dry run] ' : ''}Seeding ${projects.length} projects into ${PROJECT}…\n`);

const auth = DRY ? '' : token();
let ok = 0;
let failed = 0;

for (const [i, p] of projects.entries()) {
  // `order` is what the site sorts on; seed it from the array position so the
  // published order matches the list that was reviewed.
  const doc = { ...p, order: (i + 1) * 10 };
  if (DRY) {
    console.log(`  ${doc.id.padEnd(5)} ${doc.title.padEnd(18)} order=${doc.order}`);
    ok++;
    continue;
  }
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(doc.id)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fields(doc) }),
  });
  if (res.ok) {
    console.log(`  + ${doc.id.padEnd(5)} ${doc.title}`);
    ok++;
  } else {
    console.error(`  ! ${doc.id.padEnd(5)} ${res.status} ${(await res.text()).slice(0, 180)}`);
    failed++;
  }
}

console.log(`\n${ok} written, ${failed} failed.`);
process.exit(failed ? 1 : 0);
