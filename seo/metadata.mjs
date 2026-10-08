import { origin, image, structuredData } from './pages.mjs';
export const escapeHtml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function metadata(page) {
  const title=escapeHtml(page.title),description=escapeHtml(page.description),url=origin+page.path;
  return `<title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Mehdi Acho">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Mehdi Acho">
  <meta property="og:locale" content="en_BW">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="Four CAD views of a modelled laptop charger brace">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="Four CAD views of a modelled laptop charger brace">
  <script type="application/ld+json">${JSON.stringify(structuredData(page)).replace(/</g,'\\u003c')}</script>`;
}
