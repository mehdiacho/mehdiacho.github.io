// Publishes a static web app's build at mehdiacho.tech/projects/<name>/.
//
//   node scripts/add-project.mjs <name> <build-dir> --repo owner/repo --build "npm run build:demo"
//
// The build must already be made for the base path /projects/<name>/. It is
// copied into public/projects/<name>/ (replacing what was there), which Vite
// copies into dist, and recorded in projects/hosted.json so the next update
// knows where it came from. See projects/README.md.
import { cp, rm, readFile, writeFile, stat } from 'node:fs/promises';

const [name, from, ...rest] = process.argv.slice(2);
const flag = (f) => { const i = rest.indexOf(f); return i >= 0 ? rest[i + 1] : undefined; };
if (!name || !from || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error('Usage: node scripts/add-project.mjs <name> <build-dir> [--repo owner/repo] [--build "command"]');
  process.exit(1);
}
const index = await readFile(`${from}/index.html`, 'utf8').catch(() => null);
if (index === null) throw Error(`${from}/index.html not found: point at the app's build folder`);
if (!index.includes(`/projects/${name}/`)) {
  throw Error(`${from}/index.html doesn't load its files from /projects/${name}/. Build it with that base path.`);
}

const to = `public/projects/${name}`;
await rm(to, { recursive: true, force: true });
await cp(from, to, { recursive: true });

const file = 'projects/hosted.json';
const hosted = JSON.parse(await readFile(file, 'utf8').catch(() => '{}'));
hosted[name] = {
  ...hosted[name],
  kind: 'static',
  ...(flag('--repo') && { repo: flag('--repo') }),
  ...(flag('--build') && { build: flag('--build') }),
  updated: new Date().toISOString().slice(0, 10),
};
await writeFile(file, JSON.stringify(hosted, null, 2) + '\n');
console.log(`Copied ${from} to ${to}. Commit both and merge to main; it goes live at https://mehdiacho.tech/projects/${name}/`);
