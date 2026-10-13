/**
 * Copies `pitch` and `category` from the bundled PROJECTS array into the
 * matching Firestore documents (matched by title), leaving every other field
 * as admin last saved it. Unlike seed-firestore.mjs, this never replaces a
 * whole document.
 *
 *   npx tsx scripts/update-project-copy.mjs [--dry]
 *
 * Auth comes from `gcloud auth print-access-token`.
 */
import { execFileSync } from 'node:child_process';
import { PROJECTS } from '../constants.ts';

const BASE = 'https://firestore.googleapis.com/v1/projects/mehdi-00/databases/(default)/documents';
const DRY = process.argv.includes('--dry');
const token = execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8', shell: process.platform === 'win32' }).trim();
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const listing = await (await fetch(`${BASE}/projects?pageSize=100`, { headers })).json();
let patched = 0;
for (const doc of listing.documents ?? []) {
  const title = doc.fields?.title?.stringValue;
  const local = PROJECTS.find(p => p.title === title);
  if (!local) { console.log(`skip ${title}: not in constants.ts`); continue; }
  if (doc.fields?.pitch?.stringValue === local.pitch && doc.fields?.category?.stringValue === local.category) continue;
  console.log(`${DRY ? 'would update' : 'update'} ${title}`);
  if (DRY) continue;
  const url = `https://firestore.googleapis.com/v1/${doc.name}?updateMask.fieldPaths=pitch&updateMask.fieldPaths=category&currentDocument.exists=true`;
  const body = JSON.stringify({ fields: { pitch: { stringValue: local.pitch }, category: { stringValue: local.category } } });
  const res = await fetch(url, { method: 'PATCH', headers, body });
  if (!res.ok) throw new Error(`${title}: ${res.status} ${await res.text()}`);
  patched++;
}
console.log(DRY ? 'Dry run, nothing written.' : `Updated ${patched} documents.`);
