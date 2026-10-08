/**
 * Subdomain aliases for mehdiacho.tech.
 *
 * Mehdi wanted memorable links — 3d.mehdiacho.tech, cad., web. — without
 * splitting the site's search authority across four hostnames. A subdomain is
 * a separate site to Google and starts from zero, so the content stays at the
 * apex and these hosts serve the same bytes with a <link rel="canonical">
 * pointing home. That canonical is already in the prerendered HTML, because
 * seo/metadata.mjs builds it from `origin + page.path` regardless of which
 * host served the request — so there is nothing to rewrite here.
 *
 * The root of each alias maps to its page; every other path falls through to
 * the same assets the apex serves, so stylesheets, fonts and images resolve.
 */
const ROOTS = {
  '3d.mehdiacho.tech': '/3d-modeling-botswana/',
  'cad.mehdiacho.tech': '/cad-modeling-botswana/',
  'web.mehdiacho.tech': '/web-development-gaborone/',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const root = ROOTS[url.hostname];

    if (root && (url.pathname === '/' || url.pathname === '')) {
      url.pathname = root;
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
