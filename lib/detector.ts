/**
 * Detector view.
 *
 * One fixed canvas over the page. While it is on, everything a detector
 * would pick out on screen (headings, text, images, links, buttons, and
 * anything tagged with data-det) gets a dashed box, a class and a
 * confidence. Nothing on the page itself is changed; D or Escape ends it.
 */
const ACID = '#ccff00', INK = '#141619';
const SELECTOR = '[data-det], h1, h2, h3, p, img, a[href], button, summary';
const MAX = 90;

let canvas: HTMLCanvasElement | undefined, status: HTMLElement | undefined;
let raf = 0, found: { el: Element; label: string; conf: string }[] = [], lastScan = 0;

const classOf = (el: Element): string => {
  const tagged = (el as HTMLElement).dataset.det;
  if (tagged) return tagged;
  switch (el.tagName) {
    case 'H1': case 'H2': case 'H3': return 'heading';
    case 'P': return 'text';
    case 'IMG': return 'image';
    case 'A': return 'link';
    default: return 'button';
  }
};

/** The same element always gets the same confidence, so boxes do not flicker. */
const confidence = (label: string, i: number) => {
  let h = i * 31;
  for (const ch of label) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return (.8 + (h % 20) / 100).toFixed(2);
};

function scan() {
  const all = [...document.querySelectorAll(SELECTOR)].filter((el) => !el.closest('[inert], [aria-hidden="true"], .sr-only, dialog:not([open])'));
  found = all.map((el, i) => { const label = classOf(el); return { el, label, conf: confidence(label, i) }; });
}

function draw(now: number) {
  if (!canvas) return;
  if (now - lastScan > 600) { scan(); lastScan = now; }
  const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  const c = canvas.getContext('2d')!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  c.font = '500 11px ' + (getComputedStyle(document.documentElement).getPropertyValue('--font-label').trim() || 'ui-monospace, monospace');
  let n = 0;
  for (const { el, label, conf } of found) {
    if (n >= MAX) break;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 8 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
    if ((el as HTMLElement).checkVisibility && !(el as HTMLElement).checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    // Skip anything with something else lying over it, like the hero under a sheet.
    const hit = document.elementFromPoint(Math.min(W - 1, Math.max(0, r.left + r.width / 2)), Math.min(H - 1, Math.max(0, r.top + r.height / 2)));
    if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) continue;
    n++;
    const x = Math.round(r.left) - 4.5, y = Math.round(r.top) - 3.5, w = Math.round(r.width) + 9, h = Math.round(r.height) + 7;
    // Ink under acid, so the box reads on the dark desk and on paper alike.
    c.setLineDash([]); c.lineWidth = 3; c.strokeStyle = INK; c.globalAlpha = .55; c.strokeRect(x, y, w, h);
    c.globalAlpha = 1; c.setLineDash([5, 4]); c.lineWidth = 1.4; c.strokeStyle = ACID; c.strokeRect(x, y, w, h);
    const text = label + ' ' + conf, tw = c.measureText(text).width + 10;
    const lx = Math.max(2, Math.min(W - tw - 2, x)), ly = y - 16 < 2 ? y + 1 : y - 16;
    c.setLineDash([]); c.fillStyle = INK; c.fillRect(lx - 1, ly - 1, tw + 2, 18);
    c.fillStyle = ACID; c.fillRect(lx, ly, tw, 16);
    c.fillStyle = INK; c.fillText(text, lx + 5, ly + 12);
  }
  const note = 'detector view · ' + n + ' objects · D to exit', nw = c.measureText(note).width + 16;
  c.fillStyle = INK; c.fillRect(12, H - 38, nw, 24); c.strokeStyle = ACID; c.lineWidth = 1; c.strokeRect(12.5, H - 37.5, nw - 1, 23);
  c.fillStyle = ACID; c.fillText(note, 20, H - 22);
  raf = requestAnimationFrame(draw);
}

const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && canvas) toggleDetector(); };

export function toggleDetector() {
  if (canvas) {
    cancelAnimationFrame(raf); canvas.remove(); canvas = undefined;
    removeEventListener('keydown', onEscape);
    delete document.documentElement.dataset.detector;
    if (status) status.textContent = 'Detector view off.';
    return;
  }
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:90;pointer-events:none';
  document.body.appendChild(canvas);
  if (!status) {
    status = document.createElement('div');
    status.setAttribute('role', 'status'); status.className = 'sr-only';
    document.body.appendChild(status);
  }
  status.textContent = 'Detector view on. Press D to turn it off.';
  document.documentElement.dataset.detector = 'on';
  addEventListener('keydown', onEscape);
  lastScan = 0;
  raf = requestAnimationFrame(draw);
}
