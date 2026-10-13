# Signal Run — 2026-10-13

Implemented: deterministic daily 4×4 weighted circuits, TX-to-RX routing through two required relays, tap and keyboard controls, undo, replay-derived scores and per-browser best results. A shortest-path solver over node/relay states establishes the optimum. No speed bonus.

## Two ranking modes

The local leaderboard says **THIS BROWSER ONLY**. It contains only saved runs, has no invented competitors, and can be edited by the browser owner. Storage failure falls back to the current session.

The separate shared service is implemented in `game-worker/` and verified locally with Cloudflare's runtime and D1. Set `VITE_SIGNAL_API_URL` at build time to connect it. With a localhost endpoint the UI says **Preview rankings**, never public rankings. With no endpoint, the game remains fully playable and says shared rankings are offline. Merely loading the page does not contact the service; visitors explicitly load rankings or publish a route.

## Server behavior

- Recomputes scores from the daily route; rejects missing relays, disconnected steps, post-finish moves, oversized JSON and dates other than today for submissions.
- Keeps the best score per day and random browser identifier; generated ROUTE aliases avoid free-text public names. A local callsign is never sent.
- Stores the hashed identifier, generated alias, score/cost and server timestamp. No raw route, raw identifier or raw IP is stored. Hourly rate buckets are derived from the edge-provided address and hour; this is pseudonymization, not a claim of anonymity.
- Limits submission attempts to 30 per address per hour. Bounded reads (4 KB), parameterized SQL, exact origin allowlist, request timeouts, failure feedback and retry controls.
- Daily cleanup removes expired rate buckets and results older than 30 days. No authentication: a cleared browser is a new player, and automated optimal solvers remain possible. This is a casual board, not a prize competition.
- Isolated from the existing vault and Firestore content rules.

## Local commands

From `game-worker`: `npm ci`, `npm run types`, `npm run check`, `npm run migrate:local`, then `npm run dev` (port 8788). From the portfolio root, set `VITE_SIGNAL_API_URL=http://127.0.0.1:8788` in the build process environment, then `npm run build` and preview on 4173. The environment value is not committed or written into the user's existing env file.

Tests: `npx tsx scripts/check-signal-game.ts` checks 120 boards against an independent solver and malformed/replayed inputs. With the local worker running, `npx tsx scripts/check-signal-service.ts` verifies the real D1 service, CORS, score recomputation, best-run replacement, and rate limiting. It prints its generated test alias for targeted cleanup in the local database. Browser verification completed the optimal route with arrow keys and published it to the preview board.

## Publication remains

No remote database, worker or site deployment was performed. The all-zero database ID in wrangler.jsonc is deliberately a local-only placeholder. To publish, create an isolated D1 database, record its returned ID, apply the migration remotely, deploy the worker, and build the portfolio with its real HTTPS endpoint. Remove localhost origins from the production allowlist, check the public privacy notice against the actual host/retention, then verify the live integration. Preserve generated binding types and rerun `wrangler types` after changing configuration.
