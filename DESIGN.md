# DESIGN.md — mehdiacho.tech

Read this before building or changing anything visible on the site, by hand or
with an AI tool. It describes the system that already exists in `index.css`;
when the two disagree, `index.css` wins and this file gets fixed.

## The idea

The page is not one design. Each section is dressed for what it holds, and the
change from one section to the next should be felt, like turning to a different
kind of paper. Nothing should look like a generated SaaS landing page: no Inter,
no soft grey cards on white, no purple gradients, no glassmorphism.

## Themes

A section picks a theme with `data-theme` (set through `<Section theme=…>`).
Every theme redefines the same semantic tokens, so components only ever ask for
`ink`, `paper`, `accent`, never a raw colour.

| Theme | Used for | Ground | Ink | Accent | Panel |
|---|---|---|---|---|---|
| `brut` | hero, research, play, contact | `#141619` black | `#f4f1e8` | `#ccff00` acid | square, 3px border, hard 10px acid shadow |
| `riso` | side quests | `#f8f0e1` warm stock | `#1a1410` | `#ff4b12` hot | square, 2px border, 7px hot shadow |
| `swiss` | software | `#ffffff` | `#000000` | `#e5231b` signal red | square, 1px hairline, no shadow |
| `blueprint` | CAD | `#0b2a57` navy + grid | `#e9f4ff` | `#3fd2f2` cyan | square, 1px cyan line, no shadow |
| `soft` | Desk Twin | `#e8f6ef` mint | `#0f2118` | `#0d7a52` forest | 26px radius, no border, soft drop shadow |
| `ledger` | background | `#fdf5d4` butter + ruled lines | `#1b1a12` | `#9a6207` ochre | 3px radius, 2px border, 5px ink shadow |

Rules:
- Acid `#ccff00` only ever sits on black.
- `soft` is the only rounded theme. Everything else is square or nearly so.
- Only `ledger` (ruled) and `blueprint` (gridded) carry a background texture.
- New sections reuse one of these six. A seventh theme needs a reason.

Semantic tokens each theme sets: `--color-paper`, `--color-paper-lift`,
`--color-ink`, `--color-ink-soft`, `--color-ink-faint`, `--color-rule`,
`--color-rule-soft`, `--color-accent`, `--color-accent-ink`, plus panel
geometry `--panel-radius`, `--panel-border`, `--panel-line`, `--panel-shadow`,
`--panel-raise`.

## Type

All self-hosted, all OFL, in `/public/fonts`. There is no Inter here on purpose.

| Family | Job | Notes |
|---|---|---|
| Grotesk | everything | 700 for headings, 400 for body, 200 rarely |
| Lineal | the wordmark only | its N is reversed by design, so never in a sentence |
| Pilowlava | one word, once, in contact | do not spread it |
| Fira Code | labels and drawing-sheet notes | `.label`: 11px, upper case, `.16em` tracking |

- Body: 17px, line height 1.6.
- Section heading `.h-section`: Grotesk 700, `clamp(2rem, 5.2vw, 4.4rem)`,
  line height .98, tracking `-.035em`, balanced wrap.
- Hero name: up to 8.8rem, tracking `-.055em`.
- Keep running text to about 52–75ch with columns; there is no page max-width.

## Layout

- `.bleed` is the gutter: `clamp(1.1rem, 3.2vw, 4.5rem)`. Sections use the full
  screen width.
- Project cards sit on `.bento`, a 12-column grid that collapses at 680px and
  1100px.
- Numbered sections (`.numeral`, 01–07) and drawing furniture (`.dimline`,
  `.ticked`, `.stamp`) are part of the voice. Use them instead of inventing
  new ornaments.

## Components to reuse

- `.panel`, `.panel-lift`, `.panel-invert`: one element, six looks, driven by
  the panel tokens. Do not hand-style a card.
- `.btn` (solid, the main ask) and `.btn-hollow` (the alternative). Both take
  the section's colours.
- `.ruled` for hairline-separated lists.

## Motion

- Hard themes move hard: `.panel-lift` jumps with `steps(2)` over 90ms.
- Soft moves are reserved for objects: cards use
  `cubic-bezier(.2,.8,.2,1)` over .4s; the role wheel turns over 850ms on
  `cubic-bezier(.65,0,.25,1)`.
- Use framer-motion (already installed) for anything beyond CSS. Do not add a
  second animation library.
- Every motion respects `prefers-reduced-motion: reduce`, either by switching
  off or by becoming an instant change.

## Focus and accessibility

- Focus ring: 3px solid in the section's accent, offset 3px. Never remove it.
- Text colours must keep WCAG AA contrast on their own theme's ground.
- Decorative furniture is `aria-hidden`.

## Bringing in outside components

Libraries such as Cult UI or Watermelon UI are built for shadcn, which this
site does not use. When borrowing one:

1. Copy the single component's source; do not run `shadcn init` or add its
   theme.
2. Replace its colours, radii, shadows and fonts with this file's tokens and
   classes. If it still looks like the library afterwards, it is not done.
3. Swap `motion/react` imports for `framer-motion`.
4. No WebGL, shader or canvas effect on initial page load. Load it on
   interaction or when scrolled into view, the way `InlineModel` loads the
   CAD viewer.
5. Run the checks below before pushing.

## Performance budget

Lighthouse sits at 97–100 and should stay there. `node scripts/check-budget.mjs`
(run after `npm run build`) fails if any of these are exceeded:

| What | Budget (gzip) | At time of writing |
|---|---|---|
| Main entry JS (`index-*.js`) | 110 KB | 95.2 KB |
| All CSS | 20 KB | 14.8 KB |
| Any other chunk except the CAD viewer | 60 KB | 43.9 KB (Vault) |
| CAD viewer (lazy, three.js) | 160 KB | 141.9 KB |

Analytics stay opt-in only. No new third-party script loads before consent.

## Checks

```
npx tsc --noEmit
npm run build
node scripts/check-public-build.mjs
node scripts/check-budget.mjs
npx tsx scripts/check-signal-game.ts
```
