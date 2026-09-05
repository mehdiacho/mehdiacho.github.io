/**
 * Generates the project card cover art in `public/covers/`.
 *
 * The cards render at h-32 and are grayscaled until hover, so the covers are
 * deliberately flat and geometric — a photograph reads as noise at that size.
 *
 * To use a real screenshot instead, drop `<slug>.png` in `public/covers/` and
 * point that project's `image` at it. This script only ever writes `.svg`, so
 * it will never clobber a screenshot.
 *
 *   node scripts/gen-covers.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'covers');

const W = 800;
const H = 400;
const BG = '#09090b';     // zinc-950, matches the card
const GRID = '#18181b';   // zinc-900
const DIM = '#3f3f46';    // zinc-700
const INK = '#a1a1aa';    // zinc-400
const ACCENT = '#06b6d4'; // cyan-500

/** Deterministic PRNG, so regenerating never reshuffles a cover. */
function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

// ---------------------------------------------------------------- motifs ---

const motifs = {
  /** Spoken waveform resolving into ruled, structured lines. */
  voice(r) {
    let out = '';
    const cx = 250;
    for (let i = 0; i < 46; i++) {
      const x = 96 + i * 6.6;
      const h = (14 + r() * 96) * (1 - Math.abs(x - cx) / 460);
      out += `<rect x="${x.toFixed(1)}" y="${(200 - h).toFixed(1)}" width="3" height="${(h * 2).toFixed(1)}" fill="${i % 7 === 0 ? ACCENT : DIM}" opacity="${i % 7 === 0 ? 0.9 : 0.45}"/>`;
    }
    out += `<path d="M 430 200 L 476 200 M 462 189 L 476 200 L 462 211" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.7"/>`;
    for (let i = 0; i < 5; i++) {
      const y = 128 + i * 32;
      const w = i === 0 ? 150 : 96 + r() * 106;
      out += `<rect x="516" y="${y}" width="${w.toFixed(0)}" height="7" fill="${i === 0 ? ACCENT : DIM}" opacity="${i === 0 ? 0.85 : 0.5}"/>`;
      if (i > 1) out += `<rect x="500" y="${y - 1}" width="9" height="9" fill="none" stroke="${ACCENT}" stroke-width="1.4" opacity="0.7"/>`;
    }
    return out;
  },

  /** Hex battlefield with facing arcs — the tactics grid. */
  hexfield(r) {
    let out = '';
    const R = 34;
    const hex = (cx, cy) => {
      const p = [];
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 180) * (60 * k - 30);
        p.push(`${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`);
      }
      return p.join(' ');
    };
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 9; col++) {
        const cx = 120 + col * 59 + (row % 2 ? 29.5 : 0);
        const cy = 92 + row * 51;
        const hot = r() > 0.84;
        out += `<polygon points="${hex(cx, cy)}" fill="${hot ? ACCENT : 'none'}" fill-opacity="${hot ? 0.14 : 0}" stroke="${hot ? ACCENT : DIM}" stroke-width="${hot ? 1.7 : 1}" opacity="${hot ? 0.95 : 0.42}"/>`;
      }
    }
    out += `<circle cx="297" cy="194" r="15" fill="${BG}" stroke="${ACCENT}" stroke-width="2.2"/>`;
    out += `<path d="M 297 194 L 356 194 M 344 184 L 356 194 L 344 204" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.85"/>`;
    out += `<path d="M 268 165 A 42 42 0 0 1 268 223" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.55" stroke-dasharray="4 4"/>`;
    return out;
  },

  /** A drawing sheet: title block, dimension line, section marks. */
  sheet(r) {
    let out = `<rect x="96" y="76" width="608" height="248" fill="none" stroke="${DIM}" stroke-width="1.4" opacity="0.75"/>`;
    out += `<rect x="110" y="90" width="580" height="220" fill="none" stroke="${DIM}" stroke-width="1" opacity="0.4"/>`;
    // title block, bottom right
    out += `<rect x="506" y="238" width="184" height="72" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0.85"/>`;
    for (let i = 1; i < 4; i++) out += `<line x1="506" y1="${238 + i * 18}" x2="690" y2="${238 + i * 18}" stroke="${ACCENT}" stroke-width="0.9" opacity="0.5"/>`;
    out += `<line x1="586" y1="238" x2="586" y2="310" stroke="${ACCENT}" stroke-width="0.9" opacity="0.5"/>`;
    // plan geometry
    out += `<rect x="150" y="126" width="150" height="96" fill="none" stroke="${INK}" stroke-width="1.6" opacity="0.8"/>`;
    out += `<rect x="176" y="152" width="98" height="44" fill="none" stroke="${DIM}" stroke-width="1" opacity="0.6"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 330 + i * 26;
      out += `<line x1="${x}" y1="${120 + r() * 10}" x2="${x}" y2="${212 - r() * 10}" stroke="${DIM}" stroke-width="1" opacity="0.45"/>`;
    }
    // dimension line with ticks
    out += `<line x1="150" y1="248" x2="300" y2="248" stroke="${ACCENT}" stroke-width="1.2" opacity="0.9"/>`;
    out += `<path d="M 150 242 l 0 12 M 300 242 l 0 12" stroke="${ACCENT}" stroke-width="1.2" opacity="0.9"/>`;
    out += `<circle cx="126" cy="106" r="9" fill="none" stroke="${ACCENT}" stroke-width="1.4" opacity="0.8"/>`;
    return out;
  },

  /** Two stores with an arrow pulling one way — the missing direction. */
  pull(r) {
    let out = '';
    const stack = (x, label) => {
      let s = '';
      for (let i = 0; i < 4; i++) {
        s += `<rect x="${x}" y="${118 + i * 34}" width="140" height="24" fill="none" stroke="${DIM}" stroke-width="1.2" opacity="0.6"/>`;
        s += `<rect x="${x + 8}" y="${125 + i * 34}" width="${(40 + r() * 78).toFixed(0)}" height="6" fill="${DIM}" opacity="0.5"/>`;
      }
      return s;
    };
    out += stack(112);
    out += stack(548);
    // the greyed-out push, and the accented pull this project adds
    out += `<path d="M 268 148 L 536 148" fill="none" stroke="${DIM}" stroke-width="1.4" opacity="0.35" stroke-dasharray="5 5"/>`;
    out += `<path d="M 524 140 L 536 148 L 524 156" fill="none" stroke="${DIM}" stroke-width="1.4" opacity="0.35"/>`;
    out += `<path d="M 536 236 L 268 236" fill="none" stroke="${ACCENT}" stroke-width="2.4"/>`;
    out += `<path d="M 280 227 L 268 236 L 280 245" fill="none" stroke="${ACCENT}" stroke-width="2.4"/>`;
    out += `<circle cx="402" cy="236" r="17" fill="${BG}" stroke="${ACCENT}" stroke-width="1.8"/>`;
    out += `<path d="M 402 228 L 402 244 M 395 238 L 402 245 L 409 238" fill="none" stroke="${ACCENT}" stroke-width="1.8"/>`;
    return out;
  },

  /** Seats around a ring, credit flowing between them. */
  seats(r) {
    let out = '';
    const cx = 400, cy = 200, rad = 108;
    const n = 12;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
    }
    out += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${DIM}" stroke-width="1" opacity="0.4" stroke-dasharray="3 6"/>`;
    for (const [i, [x, y]] of pts.entries()) {
      const filled = r() > 0.35;
      out += `<rect x="${(x - 11).toFixed(1)}" y="${(y - 11).toFixed(1)}" width="22" height="22" fill="${filled ? ACCENT : BG}" fill-opacity="${filled ? 0.2 : 1}" stroke="${filled ? ACCENT : DIM}" stroke-width="1.5" opacity="${filled ? 1 : 0.5}"/>`;
      if (filled) out += `<path d="M ${(x - 5).toFixed(1)} ${y.toFixed(1)} l 4 5 l 7 -9" fill="none" stroke="${ACCENT}" stroke-width="1.7"/>`;
      const to = pts[(i + 5) % n];
      if (r() > 0.68) out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${to[0].toFixed(1)}" y2="${to[1].toFixed(1)}" stroke="${ACCENT}" stroke-width="0.9" opacity="0.28"/>`;
    }
    out += `<text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="21" fill="${INK}" opacity="0.75">14d</text>`;
    return out;
  },

  /** Basket totals resolving into a forecast that runs past them. */
  forecast(r) {
    let out = '';
    const base = 292;
    const vals = [];
    for (let i = 0; i < 9; i++) vals.push(46 + r() * 96);
    for (const [i, v] of vals.entries()) {
      const x = 108 + i * 40;
      out += `<rect x="${x}" y="${(base - v).toFixed(1)}" width="22" height="${v.toFixed(1)}" fill="${DIM}" opacity="0.42"/>`;
      out += `<rect x="${x}" y="${(base - v).toFixed(1)}" width="22" height="4" fill="${ACCENT}" opacity="0.75"/>`;
    }
    out += `<line x1="96" y1="${base}" x2="704" y2="${base}" stroke="${DIM}" stroke-width="1.2" opacity="0.6"/>`;
    // the projection: dashed, climbing past the measured bars
    let d = `M 119 ${(base - vals[0]).toFixed(1)}`;
    for (let i = 1; i < 9; i++) d += ` L ${119 + i * 40} ${(base - vals[i]).toFixed(1)}`;
    d += ` L 588 132 L 668 104`;
    out += `<path d="${d}" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.9" stroke-dasharray="0 0"/>`;
    out += `<path d="M 508 ${(base - vals[8]).toFixed(1)} L 668 104" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.5" stroke-dasharray="5 5"/>`;
    out += `<circle cx="668" cy="104" r="6" fill="${BG}" stroke="${ACCENT}" stroke-width="2"/>`;
    return out;
  },

  /** EEG traces collapsing into a graph. */
  wave(r) {
    let out = '';
    for (let t = 0; t < 4; t++) {
      const y = 110 + t * 62;
      let d = `M 60 ${y}`;
      for (let x = 60; x <= 470; x += 10) {
        const a = 26 * Math.sin((x / 34) + t * 1.7) * (0.45 + r() * 0.75);
        d += ` L ${x} ${(y + a).toFixed(1)}`;
      }
      out += `<path d="${d}" fill="none" stroke="${t === 1 ? ACCENT : DIM}" stroke-width="${t === 1 ? 2 : 1.25}" opacity="${t === 1 ? 0.95 : 0.5}"/>`;
    }
    const nodes = [[560, 120], [660, 92], [720, 178], [600, 220], [690, 288], [560, 300]];
    for (const [i, a] of nodes.entries()) {
      for (const b of nodes.slice(i + 1)) {
        if (r() > 0.45) continue;
        out += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${ACCENT}" stroke-width="1" opacity="0.35"/>`;
      }
    }
    for (const [x, y] of nodes) out += `<circle cx="${x}" cy="${y}" r="6" fill="${BG}" stroke="${ACCENT}" stroke-width="1.75"/>`;
    out += `<path d="M 495 200 L 535 200 M 522 189 L 535 200 L 522 211" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.7"/>`;
    return out;
  },

  /** A blocked request waiting on a human answer. */
  handshake() {
    let out = '';
    out += `<rect x="60" y="150" width="130" height="100" fill="none" stroke="${DIM}" stroke-width="1.5"/>`;
    out += `<rect x="610" y="150" width="130" height="100" fill="none" stroke="${DIM}" stroke-width="1.5"/>`;
    out += `<path d="M 190 178 L 610 178" stroke="${ACCENT}" stroke-width="2"/>`;
    out += `<path d="M 596 170 L 610 178 L 596 186" fill="none" stroke="${ACCENT}" stroke-width="2"/>`;
    out += `<path d="M 610 222 L 190 222" stroke="${INK}" stroke-width="2" stroke-dasharray="7 6" opacity="0.75"/>`;
    out += `<path d="M 204 214 L 190 222 L 204 230" fill="none" stroke="${INK}" stroke-width="2" opacity="0.75"/>`;
    for (let i = 0; i < 3; i++) {
      out += `<circle cx="${372 + i * 28}" cy="200" r="4" fill="${ACCENT}" opacity="${0.9 - i * 0.28}"/>`;
    }
    return out;
  },

  /** Hash-chained ledger blocks. */
  chain(r) {
    let out = '';
    for (let i = 0; i < 4; i++) {
      const x = 78 + i * 168;
      out += `<rect x="${x}" y="140" width="118" height="120" fill="none" stroke="${i === 2 ? ACCENT : DIM}" stroke-width="1.5"/>`;
      out += `<rect x="${x + 14}" y="160" width="90" height="6" fill="${i === 2 ? ACCENT : DIM}" opacity="0.8"/>`;
      for (let k = 0; k < 3; k++) {
        out += `<rect x="${x + 14}" y="${182 + k * 16}" width="${40 + Math.floor(r() * 48)}" height="4" fill="${INK}" opacity="0.4"/>`;
      }
      if (i < 3) out += `<path d="M ${x + 118} 200 L ${x + 168} 200" stroke="${ACCENT}" stroke-width="1.5" opacity="0.75"/>`;
    }
    return out;
  },

  /** Rendered on one box, played on another. */
  relay(r) {
    let out = '';
    out += `<circle cx="400" cy="200" r="34" fill="none" stroke="${ACCENT}" stroke-width="2"/>`;
    for (let i = 1; i <= 3; i++) {
      out += `<circle cx="400" cy="200" r="${34 + i * 36}" fill="none" stroke="${ACCENT}" stroke-width="1" opacity="${0.4 - i * 0.09}"/>`;
    }
    for (let i = 0; i < 22; i++) {
      const h = 14 + r() * 74;
      out += `<rect x="${96 + i * 12}" y="${(200 - h / 2).toFixed(1)}" width="4" height="${h.toFixed(0)}" fill="${i > 8 && i < 14 ? ACCENT : DIM}" opacity="0.7"/>`;
    }
    out += `<rect x="600" y="152" width="130" height="96" fill="none" stroke="${DIM}" stroke-width="1.5"/>`;
    out += `<circle cx="665" cy="200" r="22" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
    out += `<circle cx="665" cy="200" r="7" fill="${ACCENT}" opacity="0.85"/>`;
    return out;
  },

  /** Layered packages with one hard boundary through the middle. */
  boundary() {
    let out = '';
    const rows = [['agent', true], ['engine-core', false], ['engine-electron', false], ['shell', false]];
    rows.forEach(([label, on], i) => {
      const y = 108 + i * 52;
      out += `<rect x="120" y="${y}" width="560" height="38" fill="none" stroke="${on ? ACCENT : DIM}" stroke-width="1.5"/>`;
      out += `<text x="140" y="${y + 25}" font-family="ui-monospace,monospace" font-size="15" fill="${on ? ACCENT : INK}" opacity="${on ? 1 : 0.6}">${label}</text>`;
    });
    out += `<line x1="96" y1="196" x2="704" y2="196" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="10 7"/>`;
    out += `<text x="600" y="188" font-family="ui-monospace,monospace" font-size="13" fill="${ACCENT}">no imports</text>`;
    return out;
  },

  /** Documents in a vault, one sealed. */
  vaultDocs(r) {
    let out = '';
    for (let i = 0; i < 3; i++) {
      const x = 128 + i * 150;
      const y = 118 + i * 14;
      out += `<rect x="${x}" y="${y}" width="112" height="150" fill="${BG}" stroke="${i === 1 ? ACCENT : DIM}" stroke-width="1.5"/>`;
      for (let k = 0; k < 5; k++) {
        out += `<rect x="${x + 16}" y="${y + 26 + k * 18}" width="${44 + Math.floor(r() * 52)}" height="4" fill="${INK}" opacity="0.4"/>`;
      }
    }
    out += `<rect x="580" y="160" width="84" height="66" rx="3" fill="none" stroke="${ACCENT}" stroke-width="2"/>`;
    out += `<path d="M 600 160 v -18 a 22 22 0 0 1 44 0 v 18" fill="none" stroke="${ACCENT}" stroke-width="2"/>`;
    out += `<circle cx="622" cy="192" r="7" fill="${ACCENT}"/>`;
    return out;
  },

  /** A swipe deck. */
  deck(r) {
    let out = '';
    [[-9, 0.35], [-4.5, 0.6], [0, 1]].forEach(([rot, op], i) => {
      out += `<g transform="rotate(${rot} 360 200)"><rect x="272" y="96" width="176" height="212" fill="${BG}" stroke="${i === 2 ? ACCENT : DIM}" stroke-width="1.5" opacity="${op}"/></g>`;
    });
    for (let k = 0; k < 3; k++) {
      out += `<rect x="296" y="${248 + k * 18}" width="${58 + Math.floor(r() * 88)}" height="5" fill="${INK}" opacity="0.45"/>`;
    }
    out += `<path d="M 500 200 L 596 200 M 578 186 L 596 200 L 578 214" fill="none" stroke="${ACCENT}" stroke-width="2.5"/>`;
    out += `<path d="M 220 200 L 124 200 M 142 186 L 124 200 L 142 214" fill="none" stroke="${DIM}" stroke-width="2.5"/>`;
    return out;
  },

  /** A board loop with seated players. */
  board() {
    let out = '';
    for (let i = 0; i < 7; i++) {
      for (const y of [96, 268]) {
        out += `<rect x="${110 + i * 84}" y="${y}" width="70" height="36" fill="none" stroke="${DIM}" stroke-width="1.25"/>`;
      }
    }
    for (const y of [140, 184, 228]) {
      out += `<rect x="110" y="${y - 8}" width="70" height="36" fill="none" stroke="${DIM}" stroke-width="1.25"/>`;
      out += `<rect x="614" y="${y - 8}" width="70" height="36" fill="none" stroke="${DIM}" stroke-width="1.25"/>`;
    }
    [[145, 114], [481, 114], [145, 286], [649, 158]].forEach(([x, y], i) => {
      out += `<circle cx="${x}" cy="${y}" r="10" fill="${i === 0 ? ACCENT : BG}" stroke="${ACCENT}" stroke-width="1.75" opacity="${i === 0 ? 1 : 0.65}"/>`;
    });
    out += `<rect x="316" y="164" width="76" height="72" fill="none" stroke="${ACCENT}" stroke-width="1.5"/>`;
    out += `<circle cx="340" cy="188" r="5" fill="${ACCENT}"/><circle cx="368" cy="212" r="5" fill="${ACCENT}"/>`;
    return out;
  },

  /** Ciphertext in, a one-time key out. */
  seal(r) {
    let out = '';
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 9; col++) {
        if (r() > 0.72) continue;
        out += `<rect x="${92 + col * 26}" y="${118 + row * 28}" width="18" height="10" fill="${DIM}" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`;
      }
    }
    out += `<path d="M 348 200 L 414 200 M 400 189 L 414 200 L 400 211" fill="none" stroke="${INK}" stroke-width="1.75" opacity="0.7"/>`;
    out += `<rect x="440" y="158" width="92" height="84" rx="3" fill="none" stroke="${ACCENT}" stroke-width="2"/>`;
    out += `<path d="M 462 158 v -20 a 24 24 0 0 1 48 0 v 20" fill="none" stroke="${ACCENT}" stroke-width="2"/>`;
    out += `<circle cx="486" cy="196" r="8" fill="${ACCENT}"/><rect x="483" y="200" width="6" height="18" fill="${ACCENT}"/>`;
    out += `<path d="M 556 200 L 620 200" stroke="${ACCENT}" stroke-width="1.75" stroke-dasharray="6 5"/>`;
    out += `<rect x="628" y="182" width="82" height="36" fill="none" stroke="${ACCENT}" stroke-width="1.5"/>`;
    out += `<text x="646" y="207" font-family="ui-monospace,monospace" font-size="15" fill="${ACCENT}">1x</text>`;
    return out;
  },

  /** A photo resolving into 1-bit dots. */
  dither(r) {
    let out = '';
    const cols = 26, rows = 13;
    for (let c = 0; c < cols; c++) {
      for (let rw = 0; rw < rows; rw++) {
        const t = c / (cols - 1);
        if (r() > 0.18 + t * 0.82) continue;
        const s = 2 + (1 - t) * 6;
        out += `<circle cx="${86 + c * 25}" cy="${112 + rw * 15}" r="${s.toFixed(1)}" fill="${t > 0.62 ? ACCENT : INK}" opacity="${(0.35 + t * 0.6).toFixed(2)}"/>`;
      }
    }
    return out;
  },

  /** A terminal resolving an alias. */
  prompt() {
    let out = '';
    out += `<rect x="96" y="112" width="608" height="176" fill="none" stroke="${DIM}" stroke-width="1.5"/>`;
    out += `<line x1="96" y1="146" x2="704" y2="146" stroke="${DIM}" stroke-width="1.25"/>`;
    for (let i = 0; i < 3; i++) out += `<circle cx="${118 + i * 20}" cy="129" r="5" fill="${DIM}"/>`;
    const lines = [['$ fpx add build', ACCENT], ['  -&gt; npx vite build --mode prod', INK], ['$ fpx build', ACCENT]];
    lines.forEach(([t, col], i) => {
      out += `<text x="122" y="${188 + i * 34}" font-family="ui-monospace,monospace" font-size="17" fill="${col}" opacity="${col === INK ? 0.6 : 1}">${t}</text>`;
    });
    out += `<rect x="266" y="242" width="11" height="20" fill="${ACCENT}"/>`;
    return out;
  },

  /** A receipt, printed and torn. */
  receipt(r) {
    let out = '';
    out += `<path d="M 300 88 h 200 v 200 l -16 12 l -17 -12 l -17 12 l -17 -12 l -17 12 l -17 -12 l -17 12 l -17 -12 l -17 12 l -16 -12 z" fill="${BG}" stroke="${ACCENT}" stroke-width="1.75"/>`;
    for (let i = 0; i < 7; i++) {
      out += `<rect x="322" y="${120 + i * 21}" width="${62 + Math.floor(r() * 92)}" height="5" fill="${INK}" opacity="0.45"/>`;
    }
    out += `<rect x="322" y="268" width="156" height="6" fill="${ACCENT}" opacity="0.85"/>`;
    for (let i = 0; i < 18; i++) {
      const w = 2 + Math.floor(r() * 5);
      out += `<rect x="${120 + i * 9}" y="164" width="${w}" height="72" fill="${DIM}" opacity="0.65"/>`;
      out += `<rect x="${560 + i * 9}" y="164" width="${w}" height="72" fill="${DIM}" opacity="0.65"/>`;
    }
    return out;
  },

  /** A tally, incremented. */
  counter() {
    let out = '';
    out += `<text x="400" y="228" font-family="ui-monospace,monospace" font-size="118" fill="${ACCENT}" text-anchor="middle" letter-spacing="6">147</text>`;
    out += `<circle cx="196" cy="196" r="46" fill="none" stroke="${DIM}" stroke-width="2"/>`;
    out += `<path d="M 176 196 h 40" stroke="${INK}" stroke-width="3.5"/>`;
    out += `<circle cx="604" cy="196" r="46" fill="none" stroke="${ACCENT}" stroke-width="2"/>`;
    out += `<path d="M 584 196 h 40 M 604 176 v 40" stroke="${ACCENT}" stroke-width="3.5"/>`;
    for (let i = 0; i < 4; i++) {
      out += `<rect x="${338 + i * 14}" y="286" width="5" height="34" fill="${DIM}"/>`;
    }
    out += `<path d="M 332 320 L 402 282" stroke="${ACCENT}" stroke-width="5"/>`;
    return out;
  },

  /** Bibliography fields diffed against the registry. */
  diff(r) {
    let out = '';
    for (let i = 0; i < 6; i++) {
      const y = 118 + i * 30;
      const changed = i === 1 || i === 4;
      out += `<rect x="88" y="${y}" width="272" height="20" fill="none" stroke="${changed ? '#71717a' : DIM}" stroke-width="1"/>`;
      out += `<rect x="98" y="${y + 7}" width="${76 + Math.floor(r() * 150)}" height="5" fill="${INK}" opacity="0.42"/>`;
      out += `<rect x="440" y="${y}" width="272" height="20" fill="none" stroke="${changed ? ACCENT : DIM}" stroke-width="${changed ? 1.5 : 1}"/>`;
      out += `<rect x="450" y="${y + 7}" width="${76 + Math.floor(r() * 150)}" height="5" fill="${changed ? ACCENT : INK}" opacity="${changed ? 0.9 : 0.42}"/>`;
      out += `<text x="392" y="${y + 16}" font-family="ui-monospace,monospace" font-size="15" fill="${changed ? ACCENT : DIM}">${changed ? '!=' : '=='}</text>`;
    }
    return out;
  },
};

// ------------------------------------------------------------------ frame ---

/**
 * The motifs are all composed on an 800x400 field centred at y=200, but the
 * card slot is ~3:1 (a 393px-wide card over an h-32 image band). Rendering the
 * square-ish field into it with `object-cover` would crop the id and the label
 * off the top and bottom, so the viewBox is a 264-high window onto the middle
 * of that field — the motifs stay untouched, only the frame is cropped to fit.
 */
const VB_H = 264;          // ~3:1 against the 800-wide field, matching the card
const VB_Y = (H - VB_H) / 2;

function cover({ slug, id, label, motif }) {
  const body = motifs[motif](rng(slug));
  const top = VB_Y;
  const bottom = VB_Y + VB_H;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${VB_Y} ${W} ${VB_H}" width="${W}" height="${VB_H}" role="img" aria-label="${label}">
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${GRID}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect x="0" y="${VB_Y}" width="${W}" height="${VB_H}" fill="${BG}"/>
  <rect x="0" y="${VB_Y}" width="${W}" height="${VB_H}" fill="url(#g)"/>
  ${body}
  <!-- Only the id is drawn. The card already prints the title below the image,
       and the stack chips sit across the bottom of this band, so a label here
       would be redundant at best and half-occluded at worst. -->
  <text x="28" y="${top + 32}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace"
        font-size="17" fill="${ACCENT}" letter-spacing="3" opacity="0.8">${id}</text>
  <path d="M 14 ${top + 12} h 26 M 14 ${top + 12} v 26" stroke="${ACCENT}" stroke-width="1.5" fill="none"/>
  <path d="M ${W - 14} ${bottom - 12} h -26 M ${W - 14} ${bottom - 12} v -26" stroke="${ACCENT}" stroke-width="1.5" fill="none"/>
</svg>
`;
}

// Order and ids must match `PROJECTS` in `constants.ts` — the id is baked into
// the artwork, so reordering the cards means re-running this script.
const COVERS = [
  { slug: 'yap',             id: 'P01', label: 'YAP',             motif: 'voice' },
  { slug: 'tether',          id: 'P02', label: 'TETHER',          motif: 'handshake' },
  { slug: 'dither',          id: 'P03', label: 'DITHER',          motif: 'dither' },
  { slug: 'machine-strike',  id: 'P04', label: 'MACHINE_STRIKE',  motif: 'hexfield' },
  { slug: 'grids-to-graphs', id: 'P05', label: 'GRIDS_TO_GRAPHS', motif: 'wave' },
  { slug: 'fpx-now',         id: 'P06', label: 'FPX_NOW',         motif: 'prompt' },
  { slug: 'filmarr',         id: 'P07', label: 'FILMARR',         motif: 'deck' },
  { slug: 'kinkeep',         id: 'P08', label: 'KINKEEP',         motif: 'vaultDocs' },
  { slug: 'secure-vault',    id: 'P09', label: 'SECURE_VAULT',    motif: 'seal' },
  { slug: 'highrise',        id: 'P10', label: 'HIGHRISE',        motif: 'board' },
  { slug: 'fish-player',     id: 'P11', label: 'FISH_PLAYER',     motif: 'relay' },
  { slug: 'blackwall',       id: 'P12', label: 'BLACKWALL',       motif: 'receipt' },
  { slug: 'drafting-table',  id: 'P13', label: 'DRAFTING_TABLE',  motif: 'sheet' },
  { slug: 'tally',           id: 'P14', label: 'TALLY',           motif: 'counter' },
  { slug: 'bibverify',       id: 'P15', label: 'BIBVERIFY',       motif: 'diff' },
  { slug: 'aistudio-sync',   id: 'P16', label: 'AISTUDIO_SYNC',   motif: 'pull' },
  { slug: 'a-testers',       id: 'P17', label: 'A_TESTERS',       motif: 'seats' },
  { slug: 'smartspend',      id: 'P18', label: 'SMARTSPEND',      motif: 'forecast' },
  { slug: 'mmila',           id: 'P19', label: 'MMILA',           motif: 'chain' },
  { slug: 'agentic-browser', id: 'P20', label: 'AGENTIC_BROWSER', motif: 'boundary' },
];

mkdirSync(OUT, { recursive: true });
for (const c of COVERS) writeFileSync(resolve(OUT, `${c.slug}.svg`), cover(c), 'utf8');
console.log(`wrote ${COVERS.length} covers -> public/covers/`);
