import React from 'react';
import type { SectionTheme } from './Section';

/**
 * The rooms, as cards: one per part of the site, each on its own paper with
 * its own texture. The same strip, label, title and coloured full stop sit on
 * every card, so the six read as one family however different the paper is.
 *
 * The two square-grid textures are drawn here as small SVGs rather than
 * shipped as images: they are a few hundred rectangles and depend on nothing.
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

/** Work: a cover still loading, as a coarse mosaic that thins out. */
function mosaicField() {
  const r = rand(7), n = 14, cell = 16, size = n * cell;
  let body = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const d = (x + y) / (2 * n);
    if (r() > 1.15 - d) continue;
    const ink = r() < .3 ? '#141619' : '#e5231b';
    body += `<rect x='${x * cell}' y='${y * cell}' width='${cell}' height='${cell}' fill='${ink}' opacity='${(.25 + r() * .7).toFixed(2)}'/>`;
  }
  return svg(size, size, body);
}

/** Desk Twin: a sphere drawn in text, as on a terminal. */
function asciiSphere() {
  const ramp = ' .:-=+*#%@', rows: string[] = [];
  const W = 34, H = 15;
  for (let j = 0; j < H; j++) {
    let line = '';
    for (let i = 0; i < W; i++) {
      const x = (i / (W - 1)) * 2 - 1, y = ((j / (H - 1)) * 2 - 1);
      const z2 = 1 - x * x - y * y;
      if (z2 < 0) { line += ' '; continue; }
      const z = Math.sqrt(z2);
      const light = Math.max(0, -.5 * x - .55 * y + .67 * z);
      line += ramp[Math.min(ramp.length - 1, Math.round((.16 + .84 * light) * (ramp.length - 1)))];
    }
    rows.push(line.replace(/\s+$/, ''));
  }
  return rows.join('\n');
}

interface Room {
  key: string;
  name: string;
  href: string;
  path: string;
  theme: SectionTheme;
  label: string;
  title: string;
  line: string;
  external?: boolean;
}

const ROOMS: Room[] = [
  { key: 'work', name: 'Work', href: '/#software', path: '/#software', theme: 'swiss', label: '01 / Records', title: 'Work', line: 'Apps, tools and a game.' },
  { key: 'research', name: 'Research', href: '/research/', path: '/research/', theme: 'brut', label: '02 / MSc, BIUST', title: 'Research', line: 'Graph networks on EEG.' },
  { key: 'models', name: 'Models', href: '/models/', path: '/models/', theme: 'blueprint', label: '03 / The notebook', title: 'Models', line: 'A hobby with calipers.' },
  { key: 'quests', name: 'Side quests', href: '/#hobbies', path: '/#hobbies', theme: 'riso', label: '04 / Off the clock', title: 'Side quests', line: 'Fixing, playing, reading.' },
  { key: 'experience', name: 'Experience', href: '/#about', path: '/#about', theme: 'ledger', label: '05 / Since 2020', title: 'Experience', line: 'BIUST, Spectrum Analytics.' },
  { key: 'desk', name: 'Desk Twin', href: 'https://v2.mehdiacho.tech/', path: 'v2.mehdiacho.tech ↗', theme: 'soft', label: '06 / Elsewhere', title: 'Desk Twin', line: 'My desk, in 3D.', external: true },
];

const EEG = eegField();
const MOSAIC = mosaicField();
const SPHERE = asciiSphere();

export default function Rooms() {
  return (
    <section id="rooms" data-theme="brut" aria-labelledby="rooms-heading" className="rooms-section scroll-mt-20">
      <div className="bleed pb-20 pt-6">
        <h2 id="rooms-heading" className="label text-ink-faint">Every room</h2>
        <ul className="room-cards">
          {ROOMS.map((room) => (
            <li key={room.key}>
              <a
                href={room.href}
                data-theme={room.theme}
                className={`room-card room-${room.key}`}
                style={room.key === 'research' ? { '--room-tex': EEG } as React.CSSProperties
                  : room.key === 'work' ? { '--room-tex': MOSAIC } as React.CSSProperties : undefined}
                {...(room.external ? { target: '_blank', rel: 'noopener' } : {})}
              >
                <span className="room-strip">
                  <b className="font-mark">MA.</b>
                  <span>{room.name}</span>
                  <span>{room.path}</span>
                </span>
                {room.key === 'desk' && <pre className="room-ascii" aria-hidden="true">{SPHERE}</pre>}
                <span className="room-body">
                  <span className="room-label">{room.label}</span>
                  <span className="room-title">{room.title}<i>.</i></span>
                  <span className="room-line">{room.line}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
