import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { pages, origin } from '../seo/pages.mjs';

// One model page per print in the 3d-prints snapshot, at the slug cad-stories.ts gives it, else the manifest's.
const manifest = JSON.parse(await readFile('content/prints.json', 'utf8'));
const stories = await readFile('cad-stories.ts', 'utf8');
const pageSlug = print => stories.match(new RegExp(`print: '${print}', slug: '([^']+)'`))?.[1] ?? print;
const prints = manifest.prints.map(p => ({ ...p, path: `/models/${pageSlug(p.slug)}/` }));
const routes = [...pages.map(p => p.path), '/models/', ...prints.map(p => p.path)];
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
for (const print of prints) {
  const html = await readFile(`dist${print.path}index.html`, 'utf8');
  assert(html.includes(print.title), `Manifest title on its page: ${print.path}`);
  if (print.thumbnail) assert(html.includes(`src="${new URL(print.thumbnail, manifest.base).href}"`), `Manifest render on its page: ${print.path}`);
}
const notebook = await readFile('dist/models/index.html', 'utf8');
for (const print of prints) assert(notebook.includes(print.title), `Notebook lists ${print.slug}`);
assert(!/portfolio-3d\/models\//.test(notebook), 'Models load from the manifest, not a local copy');
for (const name of ['charger-brace','charger-measurements','mazda-flip-key']) {
  const html = await readFile(`dist/portfolio-3d/blueprints/${name}.html`, 'utf8');
  assert(html.includes('noindex,follow'), `Blueprint indexes through story: ${name}`);
  assert(!/Palapye/i.test(html), `Private title-block location removed: ${name}`);
}
assert((await readFile('dist/robots.txt','utf8')).includes(`${origin}/sitemap.xml`));
console.log(`PASS: ${routes.length} prerendered routes, unique metadata, canonical/sitemap links, local assets, the 3d-prints manifest on every model page, and blueprint publication checks.`);
