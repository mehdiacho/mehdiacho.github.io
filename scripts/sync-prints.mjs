// Copy the public 3d-prints manifest into content/prints.json.
// The model notebook prerenders from that copy, and the browser refreshes it
// from the same URL at load, so a status change upstream shows up without a
// redeploy. Run this when a print is added, so it gets its own page.
import { writeFile } from 'node:fs/promises';

const url = 'https://raw.githubusercontent.com/mehdiacho/3d-prints/main/prints.json';
const response = await fetch(url);
if (!response.ok) throw Error(`${url}: HTTP ${response.status}`);
const manifest = await response.json();
if (!Array.isArray(manifest.prints) || typeof manifest.base !== 'string') throw Error('Not a prints manifest');
for (const print of manifest.prints) {
  if (typeof print.slug !== 'string' || typeof print.title !== 'string' || typeof print.status !== 'string') throw Error(`Malformed print: ${JSON.stringify(print).slice(0, 80)}`);
}
await writeFile('content/prints.json', JSON.stringify(manifest, null, 1) + '\n');
console.log(`Wrote content/prints.json: ${manifest.prints.length} prints, generated ${manifest.generated}.`);
