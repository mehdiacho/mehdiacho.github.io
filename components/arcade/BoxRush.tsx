import React, { useEffect, useRef, useState } from 'react';
import { bestMatch, boxRect, createRound, createSky, DURATION, FIELD_H, FIELD_W, locate, MIN_GAP, MIN_SIDE } from '../../lib/arcade/box-rush';
import type { Box, Outcome, Rect, Summary, Thing } from '../../lib/arcade/box-rush';
import type { GameScreenProps } from './types';

type Effect = { at: number; kind: 'hit' | 'decoy' | 'empty' | 'miss'; rect: Rect; label: string; points?: string };
type Live = {
  round: ReturnType<typeof createRound>; start: number; clock: number; boxes: Box[]; lastBox: number;
  drag: { ax: number; ay: number; bx: number; by: number } | null; effects: Effect[];
};

// The brut theme's palette (index.css): ink ground, acid for a good box, hot for a bad one, blueprint cyan drones.
const COLORS = { drone: '#3fd2f2', bird: '#f4f1e8', rare: '#ffd166', ok: '#ccff00', bad: '#ff4b12' };

function drawThing(ctx: CanvasRenderingContext2D, thing: Thing, r: Rect, t: number) {
  const cx = r.x + r.w / 2; const cy = r.y + r.h / 2;
  ctx.save();
  if (thing.kind === 'drone') {
    ctx.strokeStyle = COLORS.drone; ctx.fillStyle = '#0b2a57'; ctx.lineWidth = 3;
    const rotor = Math.min(r.w, r.h) * 0.24;
    const corners = [[r.x + rotor, r.y + rotor], [r.x + r.w - rotor, r.y + rotor], [r.x + rotor, r.y + r.h - rotor], [r.x + r.w - rotor, r.y + r.h - rotor]];
    for (const [x, y] of corners) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); }
    ctx.beginPath(); ctx.roundRect(cx - r.w * 0.17, cy - r.h * 0.17, r.w * 0.34, r.h * 0.34, 5); ctx.fill(); ctx.stroke();
    const spin = t / 40 + thing.id;
    for (const [x, y] of corners) {
      ctx.beginPath(); ctx.ellipse(x, y, rotor, rotor * 0.45, 0, 0, Math.PI * 2); ctx.globalAlpha = 0.35; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(x - Math.cos(spin) * rotor, y - Math.sin(spin) * rotor * 0.45); ctx.lineTo(x + Math.cos(spin) * rotor, y + Math.sin(spin) * rotor * 0.45); ctx.stroke();
    }
    ctx.fillStyle = Math.floor(t / 300) % 2 ? '#ff4b12' : '#3fd2f2'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
  } else if (thing.kind === 'bird') {
    const flap = Math.sin(t / 110 + thing.id) * r.h * 0.42;
    const dir = Math.sign(thing.vx);
    ctx.strokeStyle = COLORS.bird; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(r.x + 4, cy - flap); ctx.quadraticCurveTo(cx - r.w * 0.2, cy - r.h * 0.1, cx, cy + r.h * 0.12);
    ctx.quadraticCurveTo(cx + r.w * 0.2, cy - r.h * 0.1, r.x + r.w - 4, cy - flap); ctx.stroke();
    ctx.fillStyle = COLORS.bird; ctx.beginPath(); ctx.ellipse(cx + dir * 4, cy + r.h * 0.14, r.w * 0.13, r.h * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.shadowColor = COLORS.rare; ctx.shadowBlur = 18;
    ctx.fillStyle = '#3a2f0d'; ctx.strokeStyle = COLORS.rare; ctx.lineWidth = 3;
    const panel = r.w * 0.3;
    ctx.fillRect(r.x, cy - r.h * 0.18, panel, r.h * 0.36); ctx.strokeRect(r.x, cy - r.h * 0.18, panel, r.h * 0.36);
    ctx.fillRect(r.x + r.w - panel, cy - r.h * 0.18, panel, r.h * 0.36); ctx.strokeRect(r.x + r.w - panel, cy - r.h * 0.18, panel, r.h * 0.36);
    ctx.beginPath(); ctx.arc(cx, cy, r.w * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - r.w * 0.2); ctx.lineTo(cx + r.w * 0.12, r.y + 2); ctx.stroke();
  }
  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D, things: Thing[], gone: Set<number>, t: number, live: Live | null, blink: boolean) {
  ctx.fillStyle = '#141619'; ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.strokeStyle = 'rgba(244,241,232,0.06)'; ctx.lineWidth = 1;
  for (let x = 50; x < FIELD_W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, FIELD_H); ctx.stroke(); }
  for (let y = 50; y < FIELD_H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD_W, y); ctx.stroke(); }
  // Viewfinder corners and the recording light.
  ctx.strokeStyle = 'rgba(244,241,232,0.5)'; ctx.lineWidth = 3;
  for (const [x, y, dx, dy] of [[14, 14, 1, 1], [FIELD_W - 14, 14, -1, 1], [14, FIELD_H - 14, 1, -1], [FIELD_W - 14, FIELD_H - 14, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + dy * 34); ctx.lineTo(x, y); ctx.lineTo(x + dx * 34, y); ctx.stroke();
  }
  ctx.font = '600 18px "Fira Code Variable", ui-monospace, monospace'; ctx.textBaseline = 'middle';
  if (blink) { ctx.fillStyle = '#ff4b12'; ctx.beginPath(); ctx.arc(40, 40, 7, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(244,241,232,0.7)'; ctx.fillText(live ? 'REC' : 'PREVIEW', 54, 41);

  for (const thing of things) {
    if (gone.has(thing.id)) continue;
    const r = locate(thing, t);
    if (r) drawThing(ctx, thing, r, t);
  }
  if (!live) return;
  for (const effect of live.effects) {
    const age = t - effect.at;
    if (age > 900) continue;
    const color = effect.kind === 'hit' ? COLORS.ok : effect.kind === 'empty' ? 'rgba(244,241,232,0.6)' : COLORS.bad;
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - age / 900); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
    if (effect.kind === 'empty') ctx.setLineDash([8, 8]);
    if (effect.kind !== 'miss') ctx.strokeRect(effect.rect.x, effect.rect.y, effect.rect.w, effect.rect.h);
    ctx.setLineDash([]);
    ctx.font = '700 17px "Fira Code Variable", ui-monospace, monospace'; ctx.textBaseline = 'bottom';
    const labelY = Math.max(22, effect.rect.y - 4);
    if (effect.label) { const width = ctx.measureText(effect.label).width + 10; ctx.fillRect(effect.rect.x - 1.5, labelY - 22, width, 22); ctx.fillStyle = '#141619'; ctx.fillText(effect.label, effect.rect.x + 4, labelY - 2); ctx.fillStyle = color; }
    if (effect.points) { ctx.font = '700 24px "Fira Code Variable", ui-monospace, monospace'; ctx.fillText(effect.points, effect.rect.x + effect.rect.w / 2 - 20, effect.rect.y + effect.rect.h / 2 - age / 18); }
    ctx.restore();
  }
  const misses = live.effects.filter(effect => effect.kind === 'miss' && t - effect.at < 500);
  if (misses.length) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - (t - misses[misses.length - 1].at) / 500); ctx.strokeStyle = COLORS.bad; ctx.lineWidth = 14; ctx.strokeRect(0, 0, FIELD_W, FIELD_H); ctx.restore(); }
  if (live.drag) {
    const rect = boxRect([t, live.drag.ax, live.drag.ay, live.drag.bx, live.drag.by]);
    const match = rect.w >= MIN_SIDE && rect.h >= MIN_SIDE ? bestMatch(things, gone, rect, t) : null;
    const good = match && match.iou >= 50;
    const color = good ? (match.thing.kind === 'bird' ? COLORS.bad : COLORS.ok) : '#f4f1e8';
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.setLineDash([10, 6]); ctx.strokeRect(rect.x, rect.y, rect.w, rect.h); ctx.setLineDash([]);
    if (match) { ctx.fillStyle = color; ctx.font = '600 16px "Fira Code Variable", ui-monospace, monospace'; ctx.textBaseline = 'top'; ctx.fillText(`IoU ${(match.iou / 100).toFixed(2)}`, rect.x + 4, rect.y + rect.h + 6); }
    ctx.restore();
  }
}

function describe(outcome: Outcome, t: number): Effect {
  if (outcome.type === 'hit') return { at: t, kind: 'hit', rect: outcome.rect, label: `${outcome.thing.kind === 'rare' ? 'satellite' : 'drone'} ${(outcome.iou / 100).toFixed(2)}`, points: `+${outcome.points}` };
  if (outcome.type === 'decoy') return { at: t, kind: 'decoy', rect: outcome.rect, label: 'bird ✕', points: '−40' };
  return { at: t, kind: 'empty', rect: { x: 0, y: 0, w: 0, h: 0 }, label: '', points: '' };
}

export default function BoxRush({ week, onRun }: GameScreenProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef<Live | null>(null);
  const sky = useRef<Thing[]>([]);
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'playing' | 'done'>('idle');
  const [count, setCount] = useState(3);
  const [hud, setHud] = useState({ score: 0, combo: 0, multiplier: 1, left: 60 });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [toast, setToast] = useState('');
  const phaseRef = useRef(phase); phaseRef.current = phase;

  useEffect(() => { sky.current = createSky(week); }, [week]);

  // One animation loop for every phase: an attract-mode preview until a round starts.
  useEffect(() => {
    const element = canvas.current; if (!element) return;
    const ctx = element.getContext('2d'); if (!ctx) return;
    const fit = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(element.clientWidth * ratio); element.height = Math.round(element.clientWidth * ratio * FIELD_H / FIELD_W);
    };
    fit();
    const observer = new ResizeObserver(fit); observer.observe(element);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const born = performance.now();
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      ctx.setTransform(element.width / FIELD_W, 0, 0, element.height / FIELD_H, 0, 0);
      const game = live.current;
      if (phaseRef.current === 'playing' && game) {
        const t = clock(game);
        const missed = game.round.settle(t);
        if (missed) game.effects.push({ at: t, kind: 'miss', rect: { x: 0, y: 0, w: 0, h: 0 }, label: '' });
        game.effects = game.effects.filter(effect => t - effect.at < 1000);
        drawFrame(ctx, game.round.things, game.round.gone, t, game, Math.floor(t / 500) % 2 === 0);
        const next = { score: game.round.score, combo: game.round.combo, multiplier: game.round.multiplier, left: Math.ceil((DURATION - t) / 1000) };
        setHud(current => current.score === next.score && current.combo === next.combo && current.left === next.left ? current : next);
        if (t >= DURATION) finish();
      } else if (phaseRef.current !== 'done') {
        const t = reduced ? 20_000 : Math.round((performance.now() - born) * 0.6) % DURATION;
        drawFrame(ctx, sky.current, new Set(), t, null, false);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) { live.current = { round: createRound(week), start: performance.now(), clock: 0, boxes: [], lastBox: -MIN_GAP, drag: null, effects: [] }; setPhase('playing'); return; }
    const timer = window.setTimeout(() => setCount(count - 1), 650);
    return () => window.clearTimeout(timer);
  }, [phase, count, week]);

  /** Monotonic, whole milliseconds, never past the end: exactly what the replay will see. */
  function clock(game: Live) {
    game.clock = Math.max(game.clock, Math.min(DURATION, Math.round(performance.now() - game.start)));
    return game.clock;
  }

  function finish() {
    const game = live.current; if (!game || phaseRef.current !== 'playing') return;
    phaseRef.current = 'done';
    game.round.settle(DURATION);
    const result = game.round.summary();
    setSummary(result); setPhase('done'); setToast('');
    setHud({ score: result.score, combo: game.round.combo, multiplier: game.round.multiplier, left: 0 });
    onRun({ replay: game.boxes, score: result.score });
  }

  function start() { setSummary(null); setToast(''); setCount(3); setHud({ score: 0, combo: 0, multiplier: 1, left: 60 }); setPhase('countdown'); }

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(FIELD_W, Math.max(0, Math.round((event.clientX - rect.left) / rect.width * FIELD_W))),
      y: Math.min(FIELD_H, Math.max(0, Math.round((event.clientY - rect.top) / rect.height * FIELD_H))),
    };
  }

  function down(event: React.PointerEvent<HTMLCanvasElement>) {
    const game = live.current; if (phase !== 'playing' || !game) return;
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = point(event); game.drag = { ax: x, ay: y, bx: x, by: y };
  }
  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    const game = live.current; if (!game?.drag) return;
    const { x, y } = point(event); game.drag.bx = x; game.drag.by = y;
  }
  function up(event: React.PointerEvent<HTMLCanvasElement>) {
    const game = live.current; if (!game?.drag || phaseRef.current !== 'playing') return;
    const { x, y } = point(event); const drag = { ...game.drag, bx: x, by: y }; game.drag = null;
    const t = clock(game);
    if (Math.abs(drag.bx - drag.ax) < MIN_SIDE || Math.abs(drag.by - drag.ay) < MIN_SIDE) { setToast('Drag to draw a box around a drone.'); return; }
    if (t < game.lastBox + MIN_GAP || t >= DURATION) return;
    const box: Box = [t, drag.ax, drag.ay, drag.bx, drag.by];
    try {
      const outcome = game.round.apply(box);
      game.boxes.push(box); game.lastBox = t;
      if (outcome.type === 'empty') game.effects.push({ ...describe(outcome, t), rect: boxRect(box), points: '−10' });
      else game.effects.push(describe(outcome, t));
      setToast(outcome.type === 'hit' ? '' : outcome.type === 'decoy' ? 'That was a bird. False positive.' : 'Nothing there. Empty boxes cost 10.');
    } catch { /* A box the verifier would reject is simply not recorded. */ }
  }

  const stat = (value: React.ReactNode, label: string) => <div className="ar-stat"><strong>{value}</strong><span>{label}</span></div>;
  return <div className="box-rush">
    <div className="ar-stats" aria-label="Round statistics">
      {stat(hud.score.toLocaleString('en-GB'), 'SCORE')}
      {stat(<>{hud.combo}<small> ×{hud.multiplier}</small></>, 'COMBO')}
      {stat(<>{phase === 'playing' ? hud.left : phase === 'done' ? 0 : 60}<small>s</small></>, 'TIME')}
    </div>
    <div className="panel ar-stage">
      <canvas ref={canvas} className="ar-canvas" data-playing={phase === 'playing'} role="img"
        aria-label="Box Rush play field. Drones, birds and satellites fly across a camera frame; drag a box around each drone."
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { if (live.current) live.current.drag = null; }} />
      {phase === 'idle' && <div className="ar-overlay"><p className="label ar-kicker">You are the object detector</p><h3>Box the drones. Not the birds.</h3><p>Drag a tight box around every drone before it leaves the frame. Tighter boxes score more.</p><button type="button" className="btn" onClick={start}>Start a 60-second round</button></div>}
      {phase === 'countdown' && <div className="ar-overlay ar-count" aria-live="assertive">{count || 'GO'}</div>}
      {phase === 'done' && summary && <div className="ar-overlay ar-results" role="status">
        <p className="label ar-kicker">Inference complete</p>
        <div className="ar-big">{summary.score.toLocaleString('en-GB')}</div>
        <dl className="ar-metrics">
          <div><dt>Precision</dt><dd>{summary.precision}%</dd></div><div><dt>Recall</dt><dd>{summary.recall}%</dd></div>
          <div><dt>Mean IoU</dt><dd>{(summary.meanIou / 100).toFixed(2)}</dd></div><div><dt>Best combo</dt><dd>{summary.bestCombo}</dd></div>
        </dl>
        <p className="ar-subtle">{summary.hits} detected · {summary.escaped} got away · {summary.decoys} birds boxed · {summary.empties} empty boxes</p>
        <button type="button" className="btn" onClick={start}>Play again</button>
      </div>}
    </div>
    <p className="ar-toast" aria-live="polite">{toast}</p>
    <ul className="ar-legend">
      <li><b style={{ color: COLORS.drone }}>Drone</b> points = IoU × 100</li>
      <li><b style={{ color: COLORS.rare }}>Satellite</b> rare, ×3</li>
      <li><b style={{ color: COLORS.bird }}>Bird</b> −40, breaks combo</li>
      <li><b>Every 4 in a row</b> raises the multiplier, up to ×4</li>
    </ul>
    <p className="ar-subtle">Needs a mouse, pen or touchscreen. The sky is the same for everyone all week, so practice pays.</p>
  </div>;
}
