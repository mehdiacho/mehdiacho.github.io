// Fails the build if a bundle grows past the budget in DESIGN.md.
// Run after `npm run build`.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const KB = 1024;
const dir = 'dist/assets';
const files = readdirSync(dir);
const gz = (f) => gzipSync(readFileSync(`${dir}/${f}`)).length;

const failures = [];
const check = (label, size, limit) => {
  const line = `${label}: ${(size / KB).toFixed(1)} KB / ${limit / KB} KB`;
  console.log(size > limit ? `FAIL ${line}` : `ok   ${line}`);
  if (size > limit) failures.push(line);
};

const js = files.filter((f) => f.endsWith('.js'));
const css = files.filter((f) => f.endsWith('.css'));

for (const f of js) {
  if (/^index-[\w-]+\.js$/.test(f)) check(f, gz(f), 110 * KB);
  else if (f.startsWith('cad-viewer-')) check(f, gz(f), 160 * KB);
  else check(f, gz(f), 60 * KB);
}
check('all CSS', css.reduce((sum, f) => sum + gz(f), 0), 20 * KB);

if (failures.length) {
  console.error(`\n${failures.length} over budget. See DESIGN.md before raising a limit.`);
  process.exit(1);
}
