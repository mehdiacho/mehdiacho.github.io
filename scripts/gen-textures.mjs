// Generates the small texture tiles in public/textures/.
// Run: node scripts/gen-textures.mjs
// Each texture belongs to one material on the page (see DESIGN.md, Texture):
//   graphite  the desk (body)          paper   the light sheets
//   felt      the turntable mat        grain   under the blueprint grid
//   halftone  side quests corner       contour footer, behind the coordinates
// Tiles are RGBA with low alpha so they sit over whatever colour is beneath.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const OUT = new URL('../public/textures/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Seeded so the tiles are the same on every run.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
function png(name, w, h, px) {
  // Quantise so the noise compresses: a few alpha steps, coarse colour.
  for (let i = 0; i < px.length; i += 4) {
    const a = Math.round(px[i + 3] / 10) * 10;
    px[i + 3] = Math.min(255, a);
    if (a === 0) { px[i] = px[i + 1] = px[i + 2] = 0; continue; }
    for (let k = 0; k < 3; k++) px[i + k] = Math.min(255, Math.round(px[i + k] / 51) * 51);
  }
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const file = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(new URL(name, OUT), file);
  console.log(name, w + 'x' + h, (file.length / 1024).toFixed(1) + ' KB');
}

// Blend a colour into a pixel (source-over on a transparent canvas).
function put(px, w, h, x, y, r, g, b, a) {
  x = ((Math.round(x) % w) + w) % w; y = ((Math.round(y) % h) + h) % h;
  const i = (y * w + x) * 4;
  const da = px[i + 3] / 255, sa = a / 255, oa = sa + da * (1 - sa);
  if (oa <= 0) return;
  px[i] = (r * sa + px[i] * da * (1 - sa)) / oa;
  px[i + 1] = (g * sa + px[i + 1] * da * (1 - sa)) / oa;
  px[i + 2] = (b * sa + px[i + 2] * da * (1 - sa)) / oa;
  px[i + 3] = oa * 255;
}
function noise(px, w, h, amt) {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = rnd() - 0.5;
    if (Math.abs(v) < 0.2) continue;              // leave most pixels clear
    if (v > 0) put(px, w, h, x, y, 255, 255, 255, v * 2 * amt);
    else put(px, w, h, x, y, 0, 0, 0, -v * 2 * amt);
  }
}
function line(px, w, h, x, y, ang, len, col, a) {
  for (let t = 0; t < len; t += 0.7) {
    const fade = Math.sin((t / len) * Math.PI);
    put(px, w, h, x + Math.cos(ang) * t, y + Math.sin(ang) * t, ...col, a * fade);
  }
}

// -- graphite: the desk. Fine grain plus sparse light and dark specks. ----
{
  const w = 256, h = 256, px = Buffer.alloc(w * h * 4);
  noise(px, w, h, 16);
  for (let i = 0; i < 520; i++) {
    const light = rnd() < 0.62, s = rnd() < 0.15 ? 2 : 1;
    const x = rnd() * w, y = rnd() * h, a = 30 + rnd() * 50;
    for (let dx = 0; dx < s; dx++) for (let dy = 0; dy < s; dy++)
      put(px, w, h, x + dx, y + dy, light ? 210 : 0, light ? 214 : 0, light ? 205 : 0, a);
  }
  png('graphite.png', w, h, px);
}

// -- paper: the light sheets. Short fibres, mostly dark, a few light. ------
{
  const w = 256, h = 256, px = Buffer.alloc(w * h * 4);
  noise(px, w, h, 6);
  for (let i = 0; i < 150; i++) {
    const light = rnd() < 0.3;
    line(px, w, h, rnd() * w, rnd() * h, rnd() * Math.PI, 6 + rnd() * 16,
      light ? [255, 255, 255] : [60, 50, 30], light ? 26 : 11);
  }
  png('paper.png', w, h, px);
}

// -- felt: the turntable mat. Dense curly fibres, light on dark. ----------
{
  const w = 160, h = 160, px = Buffer.alloc(w * h * 4);
  noise(px, w, h, 18);
  for (let i = 0; i < 700; i++) {
    let x = rnd() * w, y = rnd() * h, ang = rnd() * Math.PI * 2;
    const len = 3 + rnd() * 6, a = 8 + rnd() * 10;
    for (let t = 0; t < len; t++) {
      ang += (rnd() - 0.5) * 0.9;
      x += Math.cos(ang); y += Math.sin(ang);
      put(px, w, h, x, y, 200, 200, 196, a);
    }
  }
  png('felt.png', w, h, px);
}

// -- grain: under the blueprint grid. Just grain, a little cooler. --------
{
  const w = 160, h = 160, px = Buffer.alloc(w * h * 4);
  noise(px, w, h, 13);
  png('grain.png', w, h, px);
}

// -- halftone: side quests. Two inks, slightly off register, densest in ----
//    the bottom-right corner and fading out toward the text.
{
  const w = 720, h = 480, px = Buffer.alloc(w * h * 4);
  const step = 9;
  const field = (gx, gy) => {
    const dx = (w - gx) / w, dy = (h - gy) / h;
    return Math.max(0, 1 - Math.hypot(dx * 1.1, dy * 1.35));
  };
  const dots = (ox, oy, col, alpha, angle) => {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    for (let i = -w; i < w * 2; i += step) for (let j = -h; j < h * 2; j += step) {
      const gx = i * ca - j * sa + ox, gy = i * sa + j * ca + oy;
      if (gx < -step || gy < -step || gx > w + step || gy > h + step) continue;
      const r = Math.pow(field(gx, gy), 1.4) * step * 0.62;
      if (r < 0.35) continue;
      for (let y = Math.floor(gy - r - 1); y <= gy + r + 1; y++)
        for (let x = Math.floor(gx - r - 1); x <= gx + r + 1; x++) {
          if (x < 0 || y < 0 || x >= w || y >= h) continue;
          const d = Math.hypot(x - gx, y - gy);
          const cov = Math.min(1, Math.max(0, r + 0.5 - d));
          if (cov > 0) put(px, w, h, x, y, ...col, alpha * cov);
        }
    }
  };
  dots(0, 0, [17, 80, 143], 120, 0.26);
  dots(1.6, 1.1, [226, 85, 43], 190, -0.26);
  png('halftone.png', w, h, px);
}

// -- contour: the footer. Topographic lines behind the coordinates. ------
{
  const w = 900, h = 340, px = Buffer.alloc(w * h * 4);
  const f = (x, y) => Math.sin(x * 0.011 + 1.3 * Math.sin(y * 0.03))
    + Math.cos(y * 0.027 + 0.9 * Math.sin(x * 0.007)) + 0.5 * Math.sin((x + y) * 0.019);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = (f(x, y) * 3 + 9) % 1;
    const edge = Math.min(1, x / (w * 0.45));        // fade in from the left
    if (v < 0.055) put(px, w, h, x, y, 174, 171, 159, 70 * edge * (1 - v / 0.055 * 0.5));
  }
  png('contour.png', w, h, px);
}
