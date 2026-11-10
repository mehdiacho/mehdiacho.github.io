/**
 * The hero's drone.
 *
 * A line-drawn drone patrols the name inside an object-detection box. When it
 * passes behind the letters its confidence drops and the label reads
 * "occluded". Hover or focus a row of the index and it flies over to look at
 * that row, which gets a detection box of its own.
 *
 * Two canvases: one behind the text and one in front. The drone only changes
 * canvas while it is clear of the name, so it never pops through a letter.
 * It stops drawing when the hero is off screen or the tab is hidden, and
 * under reduced motion it parks beside the name and nothing travels.
 */
const PAPER = '#f4f1e8', ACID = '#ccff00', INK = '#141619';
type Box = { x: number; y: number; w: number; h: number };

export function mountDrone(hero: HTMLElement): () => void {
  const nameEl = hero.querySelector<HTMLElement>('.hero-name > span');
  const grid = hero.querySelector<HTMLElement>('.hero-grid');
  if (!nameEl || !grid) return () => {};
  const rows = [...hero.querySelectorAll<HTMLElement>('.hero-index a')];
  const mk = (cls: string) => { const c = document.createElement('canvas'); c.className = 'hero-canvas ' + cls; c.setAttribute('aria-hidden', 'true'); return c; };
  const back = mk('hero-canvas-back'), front = mk('hero-canvas-front');
  hero.insertBefore(back, grid); hero.appendChild(front);
  const bx = back.getContext('2d')!, fx = front.getContext('2d')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(hover: hover) and (pointer: fine)');
  const labelFont = '500 11px ' + (getComputedStyle(hero).getPropertyValue('--font-label').trim() || 'ui-monospace, monospace');

  let W = 0, H = 0, nb: Box = { x: 0, y: 0, w: 1, h: 1 }, R: Box[] = [], u = 10;
  let t = 2.2, last = 0, boost = 0, running = false, onScreen = true, layer: 'front' | 'back' = 'front', depth = 1;
  let hoverRow = -1, rowP = 0, raf = 0;
  const pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, trk = { x: 0, y: 0, w: 0, h: 0, init: false }, ptr = { x: -1e4, y: -1e4 };

  const rel = (el: Element): Box => { const r = el.getBoundingClientRect(), s = hero.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; };
  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1), r = hero.getBoundingClientRect(); W = r.width; H = r.height;
    for (const c of [back, front]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0); }
    nb = rel(nameEl); R = rows.map(rel);
    u = Math.max(6.5, Math.min(15, nb.h * .085));
    if (!running) draw();
  };
  const path = (t: number) => {
    const cx = nb.x + nb.w * .5, cy = nb.y + nb.h * .5, ax = nb.w * .6, ay = nb.h * .66;
    return { x: cx + ax * Math.sin(t * .33) + ax * .15 * Math.sin(t * 1.21 + .7), y: cy + ay * .72 * Math.sin(t * .58 + 1.1) + ay * .16 * Math.sin(t * 1.63), depth: Math.sin(t * .66 + .5) };
  };
  const park = () => ({ x: Math.min(W - u * 5, nb.x + nb.w + u * 4.5), y: nb.y + nb.h * .24 });
  const rowPoint = (i: number) => {
    const r = R[i]; let x = r.x - u * 4.4, y = r.y + r.h * .5;
    if (x < u * 4) { x = r.x + r.w - u * 4; y = r.y + r.h * .2; }
    return { x, y, depth: 1 };
  };

  const drawDrone = (c: CanvasRenderingContext2D, x: number, y: number, s: number, tilt: number, ph: number) => {
    c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
    c.lineWidth = 1.7 / s; c.strokeStyle = PAPER; c.lineCap = 'round';
    const arms = [[-2.1, -1.1], [2.1, -1.1], [-2.1, 1.1], [2.1, 1.1]];
    c.beginPath(); for (const [ax, ay] of arms) { c.moveTo(0, 0); c.lineTo(ax * u, ay * u * .55); } c.stroke();
    for (const [ax, ay] of arms) {
      const px = ax * u, py = ay * u * .55 - u * .35, a = ph * (ax > 0 ? 1 : -1);
      c.beginPath(); c.moveTo(px, py + u * .35); c.lineTo(px, py); c.stroke();
      c.beginPath(); c.ellipse(px, py, u * 1.05, u * .24, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(px + Math.cos(a) * u * 1.05, py + Math.sin(a) * u * .24); c.lineTo(px - Math.cos(a) * u * 1.05, py - Math.sin(a) * u * .24); c.stroke();
    }
    c.fillStyle = INK; c.beginPath(); c.rect(-u * .85, -u * .42, u * 1.7, u * .84); c.fill(); c.stroke();
    c.fillStyle = ACID; c.beginPath(); c.arc(u * .45, u * .05, u * .14, 0, Math.PI * 2); c.fill();
    c.restore();
  };
  const chip = (text: string, x: number, y: number, col: string, alpha: number) => {
    fx.save(); fx.globalAlpha = alpha; fx.font = labelFont;
    const lw = fx.measureText(text).width + 10, lx = Math.max(2, Math.min(W - lw - 2, x));
    let ly = y - 17; if (ly < 2) ly = y + 2;
    fx.fillStyle = col; fx.fillRect(lx, ly, lw, 16); fx.fillStyle = INK; fx.fillText(text, lx + 5, ly + 12); fx.restore();
  };
  const brackets = (r: Box, pad: number, alpha: number) => {
    const x = r.x - pad, y = r.y - pad, w = r.w + pad * 2, h = r.h + pad * 2, L = Math.min(14, h * .4);
    fx.save(); fx.globalAlpha = alpha; fx.strokeStyle = ACID; fx.lineWidth = 1.5; fx.beginPath();
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { fx.moveTo(cx + sx * L, cy); fx.lineTo(cx, cy); fx.lineTo(cx, cy + sy * L); }
    fx.stroke(); fx.restore(); return { x, y };
  };
  const conf = (i: number) => (.9 + ((i * 37 + 11) % 9) / 100).toFixed(2);

  function draw() {
    bx.clearRect(0, 0, W, H); fx.clearRect(0, 0, W, H);
    if (reduce.matches) { const p = park(); pos.x = p.x; pos.y = p.y; layer = 'front'; depth = 1; }
    const s = 1 + .14 * depth, hw = u * 3.3 * s, hh = u * 1.7 * s, behind = layer === 'back';
    const tilt = reduce.matches ? 0 : Math.max(-.35, Math.min(.35, vel.x * .0011));
    drawDrone(behind ? bx : fx, pos.x, pos.y, s * (behind ? .9 : 1), tilt, t * 38);
    if (hoverRow >= 0 && R[hoverRow]) {
      const e = 1 - (1 - rowP) ** 3, o = brackets(R[hoverRow], 7 + (1 - e) * 10, e);
      chip((rows[hoverRow].dataset.det || '') + ' ' + conf(hoverRow + 3), o.x, o.y, ACID, e);
    }
    const tx = pos.x - hw, ty = pos.y - hh, tw = hw * 2, th = hh * 2;
    if (!trk.init) Object.assign(trk, { x: tx, y: ty, w: tw, h: th, init: true });
    const k = reduce.matches ? 1 : .18;
    trk.x += (tx - trk.x) * k; trk.y += (ty - trk.y) * k; trk.w += (tw - trk.w) * k; trk.h += (th - trk.h) * k;
    const near = Math.hypot(ptr.x - pos.x, ptr.y - pos.y) < Math.max(64, hw * 1.5), locked = near || reduce.matches;
    const c = behind ? .58 + .06 * Math.sin(t * 3.1) : .91 + .06 * Math.sin(t * 2.3);
    fx.save(); fx.strokeStyle = locked ? PAPER : ACID; fx.lineWidth = 1.4; fx.setLineDash(locked ? [] : [5, 4]);
    fx.strokeRect(trk.x, trk.y, trk.w, trk.h); fx.restore();
    chip('drone ' + c.toFixed(2) + (behind ? ' · occluded' : near ? ' · tracking' : ''), trk.x - .7, trk.y, locked ? PAPER : ACID, 1);
  }
  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    t += dt * (1 + boost); boost *= .965; rowP = Math.min(1, rowP + dt / .2);
    const visiting = hoverRow >= 0 && !!R[hoverRow];
    const tgt = visiting ? rowPoint(hoverRow) : path(t);
    const k = visiting ? 70 : 34, c = 2 * Math.sqrt(k) * (visiting ? .8 : 1);
    vel.x += (k * (tgt.x - pos.x) - c * vel.x) * dt; vel.y += (k * (tgt.y - pos.y) - c * vel.y) * dt;
    pos.x += vel.x * dt; pos.y += vel.y * dt;
    depth += ((visiting ? 1 : tgt.depth) - depth) * .08;
    const s = 1 + .14 * depth, hw = u * 3.3 * s, hh = u * 1.7 * s;
    const clear = pos.x + hw < nb.x || pos.x - hw > nb.x + nb.w || pos.y + hh < nb.y || pos.y - hh > nb.y + nb.h;
    if (clear) layer = visiting || tgt.depth >= 0 ? 'front' : 'back';
    draw();
    raf = requestAnimationFrame(frame);
  };
  const update = () => {
    const should = onScreen && !document.hidden && !reduce.matches;
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; cancelAnimationFrame(raf); }
    if (!should && onScreen) draw();
  };
  const setRow = (i: number) => { if (i === hoverRow) return; hoverRow = i; rowP = reduce.matches ? 1 : 0; if (!running) draw(); };

  const ac = new AbortController(), on = { signal: ac.signal }, passive = { signal: ac.signal, passive: true };
  rows.forEach((a, i) => {
    a.addEventListener('pointerenter', () => { if (fine.matches) setRow(i); }, on);
    a.addEventListener('pointerleave', () => setRow(-1), on);
    a.addEventListener('focus', () => setRow(i), on);
    a.addEventListener('blur', () => setRow(-1), on);
  });
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; }, passive);
  hero.addEventListener('pointerleave', () => { ptr.x = ptr.y = -1e4; }, on);
  hero.addEventListener('pointerdown', e => { const r = hero.getBoundingClientRect(); if (Math.hypot(e.clientX - r.left - pos.x, e.clientY - r.top - pos.y) < u * 6) boost = 7; }, passive);
  nameEl.addEventListener('animationend', size, on);
  document.addEventListener('visibilitychange', update, on);
  reduce.addEventListener('change', () => { size(); update(); }, on);
  const ro = new ResizeObserver(size); ro.observe(hero);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update(); }); io.observe(hero);
  document.fonts?.ready.then(() => { if (!ac.signal.aborted) size(); });

  size();
  // It flies in from the right edge on first load.
  pos.x = W + u * 8; pos.y = nb.y - u * 2;
  update();

  return () => { running = false; cancelAnimationFrame(raf); ac.abort(); ro.disconnect(); io.disconnect(); back.remove(); front.remove(); };
}
