/**
 * The rooms: one entry per part of the site. The home page lists them in the
 * hero (components/Hero.tsx); each room page takes its texture from here.
 *
 * The EEG texture is drawn as a small SVG rather than shipped as an image:
 * it is a few hundred rectangles and depends on nothing.
 */

/** A small seeded random, so the server and the browser draw the same squares. */
function rand(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

const svg = (w: number, h: number, body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`)}")`;

/** Research: a head seen from above, as a grid of squares sized like an EEG map. */
export function eegField() {
  const n = 26, cell = 12, size = n * cell;
  const blobs = [[.36, .34, .2, 1], [.68, .58, .17, .85], [.42, .74, .14, .55]];
  let body = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = (x + .5) / n, v = (y + .5) / n;
    const r = Math.hypot(u - .5, v - .5);
    if (r > .47) continue;
    let heat = .08;
    for (const [bx, by, bs, bw] of blobs) heat += bw * Math.exp(-((u - bx) ** 2 + (v - by) ** 2) / (2 * bs * bs));
    const s = Math.min(1, heat) * (cell - 2);
    if (s < 1.4) continue;
    const o = (cell - s) / 2;
    body += `<rect x='${(x * cell + o).toFixed(1)}' y='${(y * cell + o).toFixed(1)}' width='${s.toFixed(1)}' height='${s.toFixed(1)}'/>`;
  }
  return svg(size, size, `<g fill='#ccff00'>${body}</g>`);
}

interface Room {
  key: string;
  title: string;
  href: string;
  line: string;
  external?: boolean;
}

export const ROOMS: Room[] = [
  { key: 'work', title: 'Work', href: '/#software', line: 'Apps, tools and a game.' },
  { key: 'research', title: 'Research', href: '/research/', line: 'Graph networks on EEG.' },
  { key: 'models', title: 'Models', href: '/models/', line: 'A hobby with calipers.' },
  { key: 'quests', title: 'Side quests', href: '/#hobbies', line: 'Fixing, playing, reading.' },
  { key: 'experience', title: 'Experience', href: '/#about', line: 'BIUST, Spectrum Analytics.' },
  { key: 'desk', title: 'Desk Twin', href: 'https://v2.mehdiacho.tech/', line: 'My desk, in 3D.', external: true },
];
