# Projects hosted at mehdiacho.tech/projects/

Each project lives at `https://mehdiacho.tech/projects/<name>/`. `<name>` is short, lowercase, with hyphens (`fdr`, `nightly`). [hosted.json](hosted.json) lists what's here and where each one comes from.

The site is static (GitHub Pages behind Cloudflare, deployed by `.github/workflows/Initialize Build.yml` on every push to `main`), so how a project gets here depends on what it needs.

## A web app that runs in the browser (static)

Most apps. FDR is one: its demo build needs no server.

1. In the app's repo, build it for the base path `/projects/<name>/`. With Vite that's `base: '/projects/<name>/'`; with Next.js static export, `basePath`. Use a hash router (or the app's own handling) so deep links don't depend on the server, because Pages only knows the files that exist.
2. Here, copy the build in:
   ```bash
   node scripts/add-project.mjs <name> ../<app>/dist --repo mehdiacho/<repo> --build "npm run build"
   ```
   That replaces `public/projects/<name>/` and records it in `hosted.json`. It refuses a build that wasn't made for `/projects/<name>/`.
3. Commit `public/projects/<name>/` and `projects/hosted.json`, open a PR, merge it. The site deploys itself; the app is live a couple of minutes later.

To update an app, rebuild it and run the same command again.

## A web app that needs its own server

For example Nightly (Next.js with SQLite and uploaded photos).

1. Build the app so it serves everything under `/projects/<name>` itself (Next.js: `basePath`). Its cookies should be scoped to that path.
2. Run it somewhere that stays up, normally a container on the NAS with a persistent volume for its data.
3. Publish it through a Cloudflare Tunnel at `<name>-origin.mehdiacho.tech` (Zero Trust, Networks, Tunnels, Public hostname, pointing at the container's port).
4. Here, add the app to `ORIGINS` in [projects-proxy/src/index.js](../projects-proxy/src/index.js) and a route `mehdiacho.tech/projects/<name>*` in [projects-proxy/wrangler.jsonc](../projects-proxy/wrangler.jsonc), then deploy the Worker from that folder with `npx wrangler deploy` (it needs `wrangler login` on a machine signed in to Cloudflare). Add the app to `hosted.json` with `"kind": "proxy"`.

The Worker forwards `/projects/<name>/*` to the origin with the path unchanged. Everything else on the site is untouched.

## A desktop or Android app

It doesn't run here. It gets a project page on the portfolio (what it is, screenshots, and a download or Play Store link, usually its GitHub Releases page). Mehdi writes portfolio entries himself, so prepare the material (screenshots, a short description, the release link) and hand it to him.

## greenforrest.app

Green Forrest practice and business work goes on greenforrest.app instead, which is its own site deployed through Cloudflare (wrangler) from its own repo.
