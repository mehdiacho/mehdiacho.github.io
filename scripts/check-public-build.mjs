import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { pages, origin } from '../seo/pages.mjs';

const routes = [...pages.map(p => p.path), '/models/', '/models/charger-brace/', '/models/mazda-flip-key/'];
const titles = new Set(), descriptions = new Set();
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const route of routes) {
  const html = await readFile(`dist${route}index.html`, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(title && !titles.has(title), `Unique title: ${route}`); titles.add(title);
  assert(description && !descriptions.has(description), `Unique description: ${route}`); descriptions.add(description);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `One prerendered H1: ${route}`);
  assert(html.includes(`<link rel="canonical" href="${origin+route}">`), `Canonical: ${route}`);
  assert(sitemap.includes(`<loc>${origin+route}</loc>`), `Sitemap: ${route}`);
  for (const tag of ['og:title','og:description','og:url','og:image','twitter:card','twitter:title','twitter:description']) assert(html.includes(`="${tag}"`), `${tag}: ${route}`);
  const schema = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert(schema); JSON.parse(schema);
  assert(!/[\u00c3\u00c2]|\u00e2[\u0080-\u00bf\u20ac]/.test(html), `UTF-8 content: ${route}`);
  for (const match of html.matchAll(/(?:src|href)="(\/(?!\/)[^"?#]*)/g)) {
    const path = decodeURIComponent(match[1]);
    await access('dist'+path+(path.endsWith('/') ? 'index.html' : ''));
  }
}
for (const name of ['charger-brace','mazda-flipkey-body']) {
  const bytes = await readFile(`dist/portfolio-3d/models/${name}.glb`);
  assert.equal(bytes.toString('ascii',0,4), 'glTF');
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const gltf = JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)).trim());
  assert(gltf.meshes?.length, `Geometry present: ${name}`);
  assert(gltf.buffers.every(buffer => !buffer.uri), `Self-contained GLB: ${name}`);
}
for (const name of ['charger-brace','charger-measurements','mazda-flip-key']) {
  const html = await readFile(`dist/portfolio-3d/blueprints/${name}.html`, 'utf8');
  assert(html.includes('noindex,follow'), `Blueprint indexes through story: ${name}`);
  assert(!/Palapye/i.test(html), `Private title-block location removed: ${name}`);
}
assert((await readFile('dist/robots.txt','utf8')).includes(`${origin}/sitemap.xml`));
console.log('PASS: seven prerendered routes, unique metadata, canonical/sitemap links, local assets, GLBs and blueprint publication checks.');
