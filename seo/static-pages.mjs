import { mkdir,writeFile } from 'node:fs/promises';
import { pages,origin } from './pages.mjs';
import { metadata,escapeHtml as esc } from './metadata.mjs';
export async function writeServicePages(output, stylesheet, works=[]) {
 const nav=`<nav class="service-nav" aria-label="Main navigation"><a href="/">Mehdi Acho</a>${pages.slice(1).map(p=>`<a href="${p.path}">${esc(p.heading)}</a>`).join('')}</nav>`;
 const document=(head,body)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}<link rel="stylesheet" href="${stylesheet}"></head><body>${nav}${body}<footer class="service-footer"><a href="/">Back to the portfolio</a><span>Gaborone, Botswana</span></footer></body></html>`;
 for (const page of pages.slice(1)) {
  const work=page.work&&works.length?`<section><h2>From the workbench</h2><div class="service-work">${works.map(w=>`<figure><img src="${esc(w.image)}" alt="${esc(w.alt)}" width="900" height="675" loading="lazy" decoding="async"><figcaption><h3>${esc(w.title)}</h3><p>${esc(w.caption)}</p></figcaption></figure>`).join('')}</div></section>`:`<section><h2>Explore the work</h2><p>Find projects and design studies in the portfolio.</p><a href="/">Explore Mehdi’s portfolio →</a></section>`;
  const body=`<main class="service-page"><p class="service-eyebrow">${esc(page.eyebrow)}</p><h1>${esc(page.heading)}</h1><p class="service-lead">${esc(page.intro)}</p><div class="service-sections">${page.sections.map(([h,p])=>`<section><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}</div>${work}<section class="service-contact"><h2>Talk through your project</h2><p>Based in Gaborone. Available for projects across Botswana.</p><a href="mailto:mehdiacho@gmail.com">Email Mehdi about a project →</a></section></main>`;
  await mkdir(output+page.path,{recursive:true});await writeFile(output+page.path+'index.html',document(metadata(page),body));
 }
 await writeFile(output+'/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
 await writeFile(output+'/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${origin+p.path}</loc></url>`).join('')}</urlset>`);
 await writeFile(output+'/404.html',document('<title>Page not found | Mehdi Acho</title><meta name="robots" content="noindex,follow">','<main class="service-page"><h1>Page not found</h1><p>The page may have moved.</p><a href="/">Return to the portfolio</a></main>'));
}
