/**
 * Reverse proxy for server-backed apps under mehdiacho.tech/projects/<name>/.
 *
 * The apex is a static GitHub Pages site behind Cloudflare, so an app that
 * needs a running server (Nightly: Next.js with SQLite and uploads) can't live
 * in public/projects/. Instead it runs on its own host, normally a container
 * on the NAS published through a Cloudflare Tunnel at <name>-origin.mehdiacho.tech,
 * and this Worker forwards its path there unchanged, prefix included. The app
 * must be built to serve under /projects/<name> itself.
 */
const ORIGINS = {
  nightly: 'https://nightly-origin.mehdiacho.tech',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const name = url.pathname.match(/^\/projects\/([a-z0-9-]+)(?:\/|$)/)?.[1];
    const origin = name && ORIGINS[name];
    // A route that matched but isn't configured (e.g. /projects/nightlyx) goes to the static site.
    if (!origin) return fetch(request);

    const target = new URL(url.pathname + url.search, origin);
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-Host', url.host);
    headers.set('X-Forwarded-Proto', 'https');
    try {
      return await fetch(new Request(target, { method: request.method, headers, body: request.body, redirect: 'manual' }));
    } catch {
      return new Response(`${name} is offline right now. Try again in a little while.`, {
        status: 502,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
