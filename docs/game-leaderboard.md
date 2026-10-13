# Weekly arcade — 2026-10-13

The `#play` section is a weekly game slot. One game runs per ISO week (Monday 00:00 to Sunday 23:59:59 UTC). Each week has its own scoreboard, and the week's top score goes into a permanent hall of fame with a downloadable certificate. Signal Run, the daily routing puzzle, is retired.

## This week: Box Rush (`box-rush-v1`)

You are the object detector. Drones, birds and the odd satellite fly across a camera frame for 60 seconds; drag a box around each drone before it leaves.

- A hit needs IoU ≥ 0.5 with a live drone or satellite. Points = IoU × 100 (satellites ×3), times a combo multiplier that rises every 4 hits in a row, up to ×4.
- Boxing a bird is a false positive: −40 and the combo resets. An empty box: −10. A drone that leaves unboxed resets the combo. The total never goes below 0.
- The end screen reports precision, recall, mean IoU and best combo.
- The sky is generated from the week, so it is the same for everyone all week. Practice pays.
- Needs a mouse, pen or touchscreen; there is no keyboard mode.

The engine (`lib/arcade/box-rush.ts`) uses integer arithmetic only (a mulberry32 RNG, integer motion, a triangle-wave bob instead of `Math.sin`), so every browser and the worker compute the same positions. The screen calls the same `createRound().apply()` live that the worker calls on the submitted boxes. `scripts/check-arcade.ts` checks that a frame-by-frame live round equals the replay, and rejects malformed, out-of-order, too-fast, out-of-frame and oversized runs.

## How the slot works

- `lib/arcade/registry.ts`: `GAMES` (id, version, title, body-size limit, replay scorer) and `SCHEDULE` (which game runs from which week). Shared by the site and the worker; no React.
- `components/arcade/games.tsx`: each game's screen, loaded as its own chunk, plus its one-line pitch.
- `components/arcade/Arcade.tsx`: the shell. Week, countdown, scoreboard, publishing, hall of fame, last week's champion banner. The game chunk, the scoreboard and the hall of fame load only when the section scrolls near the viewport.

### Adding next week's game

1. Write the engine in `lib/arcade/<game>.ts`: a deterministic `score(week, replay)` that throws on anything a real round could not produce. Integer maths only.
2. Register it in `GAMES`, add a `SCHEDULE` line with the week it starts, and add its screen to `components/arcade/games.tsx`. A screen gets `{ week, onRun }` and calls `onRun({ replay, score })` once per round.
3. Add its checks to `scripts/check-arcade.ts`.
4. Deploy the worker before the site (below), both before that Monday.

Bump a game's version whenever its rules change, so old clients' runs are refused instead of mis-scored.

## Server

Same worker (`portfolio-signal-run`) and D1 database (`SIGNAL_DB`), with new tables from `migrations/0002_weekly_arcade.sql`.

- `POST /runs` takes `{ week, game, version, player, name?, replay }`. It accepts only the current week (plus five minutes' grace after Sunday midnight for a round that was already running), only that week's scheduled game and version, and recomputes the score by replaying the run. It keeps each player's best for the week.
- `GET /leaderboard?week=` returns the top 10 (higher wins, equal scores share a place) and how many share first.
- `GET /champions` crowns any finished week that has no champion yet, then returns the hall of fame. Every player tied on the top score is crowned (up to five), so playing first wins nothing.
- The daily cron also crowns finished weeks, deletes weekly scores after five weeks, deletes rate-limit buckets after two hours, and deletes old Signal Run results once they pass their promised 30 days.
- Callsigns are opt-in and filtered (`lib/arcade/callsign.ts`); otherwise the board shows a generated `PLAYER-xxxxxx` alias. Stored per score: hashed browser id, alias, score, time. No raw id, IP or replay is stored. Champions keep alias, score and week permanently.
- Unchanged: 30 submissions per address per hour, exact origin allowlist, bounded body read, parameterised SQL.

Anti-cheat is the same strength as before: the server never trusts a client score, only a replay it scores itself. It cannot stop a bot that reads the screen or computes perfect boxes from the open-source engine (a near-perfect bot scores about 19,600 this week). This is a casual board. If a champion looks implausible, delete the row by hand.

## Deploy (from `game-worker/`, on Mehdi's PC)

```
npx wrangler d1 migrations apply SIGNAL_DB --remote
npx wrangler deploy
```

Then merge the site PR. Between the two steps the live site still runs Signal Run, whose scoreboard calls will fail; the puzzle itself keeps working.

## Local test

From `game-worker`: `npm ci`, `npm run migrate:local`, then `npx wrangler dev --port 8788 --var ALLOWED_ORIGINS:http://127.0.0.1:4173`. From the root: `VITE_SIGNAL_API_URL=http://127.0.0.1:8788 npm run build`, then `npx vite preview --port 4173 --host 127.0.0.1`.
