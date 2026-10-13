import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createBoard, inspectReplay, MAX_MOVES, mergeLocalRun, neighbors, nodeLabel, normalizeName,
  optimalRoute, rankLocalRuns, readLocalRuns, RELAYS, scoreReplay, sharedRanks, STORAGE_KEY, utcDay } from '../lib/signal-game';
import type { LocalRun } from '../lib/signal-game';
import SharedRankings from './SharedRankings';

const styles = `
.signal-run{--sg-bg:#101f29;--sg-panel:#172b37;--sg-line:#506a79;--sg-muted:#b3c7cf;--sg-mint:#aeffda;box-sizing:border-box;background:var(--sg-bg);color:#f4f3e9;border:1px solid #506a79;border-radius:18px;padding:clamp(16px,3vw,32px);font-family:var(--font-body,system-ui,sans-serif);line-height:1.5;text-align:left;color-scheme:dark;max-width:1100px;margin-inline:auto}
.signal-run *{box-sizing:border-box}.signal-run h2,.signal-run h3,.signal-run p{margin:0}.signal-run h2{font-size:clamp(32px,5vw,52px);font-weight:700;font-family:var(--font-display,inherit);line-height:1.1;letter-spacing:-.045em;color:#f4f3e9}.signal-run h3{font-size:18px;font-weight:700;color:#f4f3e9}.signal-run .sg-kicker{color:var(--sg-mint);font:600 11px/1.6 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase}.signal-run .sg-header{display:flex;gap:16px;align-items:center;justify-content:space-between;padding-bottom:24px;border-bottom:1px solid var(--sg-line)}.signal-run .sg-mark{border:1px solid var(--sg-line);border-radius:50%;width:64px;height:64px;display:grid;place-items:center;font:26px ui-monospace,monospace;color:var(--sg-mint);flex-shrink:0;transform:rotate(-15deg)}
.signal-run .sg-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(235px,1fr);gap:32px;margin-top:24px}.signal-run .sg-subtle{color:var(--sg-muted);font-size:13px}.signal-run .sg-intro{margin-top:10px;max-width:52ch;font-size:15px}.signal-run .sg-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:20px}.signal-run .sg-stat{border-left:2px solid var(--sg-line);padding-left:12px}.signal-run .sg-stat strong{display:block;font:600 26px/1.2 ui-monospace,monospace}.signal-run .sg-stat span{font-size:11px;color:var(--sg-muted)}
.signal-run .sg-board{position:relative;width:100%;max-width:520px;aspect-ratio:1;margin:16px auto;background-image:radial-gradient(#49606b 1px,transparent 1px);background-size:16px 16px;border:1px solid #344c59;border-radius:12px;isolation:isolate}.signal-run .sg-board svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.signal-run .sg-board line{stroke:var(--sg-line);stroke-width:2}.signal-run .sg-board line[data-used=true]{stroke:var(--sg-mint);stroke-width:4}.signal-run .sg-board text{fill:#e1e9ed;font:600 14px ui-monospace,monospace;text-anchor:middle;dominant-baseline:central}.signal-run .sg-board rect{fill:var(--sg-bg)}
.signal-run button,.signal-run input{font:inherit;line-height:1.3}.signal-run button{cursor:pointer;touch-action:manipulation}.signal-run button:focus-visible,.signal-run input:focus-visible,.signal-run summary:focus-visible{outline:3px solid #fff;outline-offset:4px}.signal-run .sg-node{position:absolute;transform:translate(-50%,-50%);width:clamp(44px,5vw,52px);height:clamp(44px,5vw,52px);display:grid;place-items:center;border:1px solid #7e99a7;border-radius:9px;background:var(--sg-panel);color:#d7e4e9;font:600 13px ui-monospace,monospace;padding:0;z-index:1}.signal-run .sg-node[data-role=relay]{border:2px solid #ffcd9f;color:#ffcd9f}.signal-run .sg-node[data-role=terminal]{background:#d8e5e8;color:#10212b;border:2px solid #d8e5e8}.signal-run .sg-node[data-visited=true]{box-shadow:inset 0 0 0 2px var(--sg-mint)}.signal-run .sg-node[data-current=true]{background:var(--sg-mint);color:#10251c;border:3px solid #fff;box-shadow:0 0 0 5px #aeffda24}.signal-run .sg-node[aria-disabled=true]{cursor:default}.signal-run .sg-legend{display:flex;gap:14px;flex-wrap:wrap;font:12px ui-monospace,monospace;color:var(--sg-muted)}.signal-run .sg-legend b{color:#ffcd9f}
.signal-run .sg-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.signal-run .sg-button{min-height:44px;padding:10px 16px;background:var(--sg-mint);color:#10251c;border:1px solid var(--sg-mint);border-radius:7px;font-size:14px;font-weight:700}.signal-run .sg-button.sg-secondary{background:transparent;color:#f4f3e9;border-color:var(--sg-line)}.signal-run .sg-button:disabled{opacity:.45;cursor:not-allowed}.signal-run .sg-button:hover:not(:disabled){filter:brightness(1.12)}.signal-run .sg-status{min-height:3em;margin-top:16px;color:var(--sg-mint);font-size:14px}.signal-run .sg-next{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.signal-run .sg-next button{font-size:12px;padding:8px 10px}.signal-run .sg-aside{min-width:0;display:flex;flex-direction:column;gap:20px}.signal-run .sg-card{padding:20px;background:var(--sg-panel);border:1px solid #344c59;border-radius:12px}.signal-run .sg-card p{margin-top:8px}.signal-run .sg-badge{display:inline-block;color:var(--sg-mint);font:600 10px/1.4 ui-monospace,monospace;letter-spacing:.1em;border:1px solid var(--sg-line);border-radius:4px;padding:4px 6px;margin-bottom:12px}.signal-run .sg-empty{border-block:1px dashed var(--sg-line);padding:24px 0;margin:20px 0;color:var(--sg-muted);font-size:14px}.signal-run table{border-collapse:collapse;width:100%;font-size:13px;margin-top:16px}.signal-run caption{text-align:left;color:var(--sg-muted);font-size:12px;margin-bottom:8px}.signal-run th,.signal-run td{padding:10px 4px;border-bottom:1px solid #3b5360;text-align:left;font-variant-numeric:tabular-nums}.signal-run th{font-size:11px;color:var(--sg-muted);font-weight:400}.signal-run td:last-child,.signal-run th:last-child{text-align:right}.signal-run td:nth-child(2){font-family:ui-monospace,monospace;overflow-wrap:anywhere}.signal-run tr[data-own=true]{color:var(--sg-mint)}.signal-run .sg-save{margin-top:16px}.signal-run .sg-check{display:flex;gap:10px;align-items:center;margin-top:14px}.signal-run .sg-check input{width:20px;min-height:20px;height:20px;accent-color:var(--sg-mint)}.signal-run label{display:block;font-size:13px;margin-bottom:8px}.signal-run input{width:100%;min-height:44px;background:var(--sg-bg);color:#fff;border:1px solid #8ca3ae;border-radius:6px;padding:10px;letter-spacing:.08em;text-transform:uppercase}.signal-run details{font-size:13px;color:var(--sg-muted)}.signal-run summary{cursor:pointer;min-height:44px;display:list-item;padding-block:12px;color:#f4f3e9}.signal-run details p{margin-top:8px}.signal-run .sg-route{overflow-wrap:anywhere;font:12px/1.8 ui-monospace,monospace}.signal-run .sg-result{font:700 36px/1.2 ui-monospace,monospace;color:var(--sg-mint);margin-top:12px}.signal-run .sg-footer{margin-top:24px;padding-top:16px;border-top:1px solid var(--sg-line);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
@media(max-width:720px){.signal-run .sg-layout{grid-template-columns:minmax(0,1fr);gap:24px}.signal-run .sg-card{padding:16px}.signal-run .sg-header{padding-bottom:20px}.signal-run .sg-mark{width:48px;height:48px;font-size:21px}}
@media(forced-colors:active){.signal-run .sg-board line{stroke:CanvasText}.signal-run .sg-board line[data-used=true]{stroke:Highlight}.signal-run .sg-board text{fill:CanvasText}.signal-run .sg-board rect{fill:Canvas}.signal-run .sg-node[data-current=true]{outline:3px solid Highlight}.signal-run .sg-node[data-visited=true]{border-style:double}}
`;

/** Self-contained; deliberately local-only. Public API wiring is documented separately. */
export default function SignalGame() {
  const id = useId();
  const [day, setDay] = useState('');
  const [path, setPath] = useState([0]);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('Ready when you are. There is no time limit.');
  const [runs, setRuns] = useState<LocalRun[]>([]);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [storageNote, setStorageNote] = useState('Saved on this browser only.');
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const board = useMemo(() => day ? createBoard(day) : null, [day]);
  const replay = useMemo(() => board ? inspectReplay(board, path) : null, [board, path]);
  const optimum = useMemo(() => board ? optimalRoute(board).cost : 0, [board]);
  const ranking = useMemo(() => day ? rankLocalRuns(runs, day) : [], [runs, day]);
  const places = useMemo(() => sharedRanks(ranking.map(run => run.cost)), [ranking]);
  const current = path.at(-1)!;
  const complete = Boolean(replay?.complete);
  const next = board ? neighbors(board, current) : [];

  useEffect(() => {
    setDay(utcDay());
    const load = () => {
      try { setRuns(readLocalRuns(localStorage.getItem(STORAGE_KEY))); }
      catch { setStorageNote('Browser storage is unavailable or damaged. New saves will try again.'); }
    };
    load();
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) load(); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => { if (complete) resultHeading.current?.focus(); }, [complete]);

  function start() {
    setDay(utcDay());
    setPath([0]); setPlaying(true); setSaved(false);
    setMessage('Signal at TX. Visit relay A and relay B, then finish at RX.');
    nodes.current[0]?.focus();
  }

  function move(node: number) {
    if (!playing || complete || !board) return;
    try {
      const updated = inspectReplay(board, [...path, node]);
      setPath(updated.path);
      setMessage(updated.complete ? 'Delivered. Your route is ready to save.'
        : `At ${nodeLabel(node)}. Cost ${updated.cost}. ${Number(Boolean(updated.relays & 1)) + Number(Boolean(updated.relays & 2))} of 2 relays collected.`);
      nodes.current[node]?.focus();
    } catch (error) { setMessage((error as Error).message); }
  }

  function undo() {
    const updated = path.slice(0, -1);
    setPath(updated); setSaved(false); setMessage('Last move undone. Keep tuning your route.');
    nodes.current[updated.at(-1)!]?.focus();
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!board || !complete || saved) return;
    try {
      const callsign = normalizeName(name);
      const run: LocalRun = { id: crypto.randomUUID(), name: callsign, day, path: [...path], recordedAt: Date.now() };
      let latest = runs;
      try { latest = readLocalRuns(localStorage.getItem(STORAGE_KEY)); } catch { /* Preserve this session's runs. */ }
      const merged = mergeLocalRun(latest, run);
      setRuns(merged); setName(callsign); setSaved(true);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        setStorageNote('Saved on this browser only.');
        setMessage(`Saved ${callsign} locally. The board keeps your best route for this puzzle.`);
      } catch {
        setStorageNote('Storage is blocked or full. Results last only until this page closes.');
        setMessage(`${callsign} is on this session’s board, but could not be saved to this browser.`);
      }
    } catch (error) { setMessage((error as Error).message); }
  }

  return <section className="signal-run" aria-labelledby={`${id}-title`}>
    <style>{styles}</style>
    <header className="sg-header"><div><p className="sg-kicker">A tiny network / a better route</p><h2 id={`${id}-title`}>Signal Run<span aria-hidden="true"> ↗</span></h2></div><span className="sg-mark" aria-hidden="true">01→</span></header>
    <div className="sg-layout">
      <div>
        <p className="sg-kicker">Daily circuit · {day || 'Loading…'} · UTC</p>
        <p className="sg-intro">Get a signal from <strong>TX</strong> to <strong>RX</strong> through relays <strong>A + B</strong>. Every link has a cost. Find the lightest route.</p>
        <div className="sg-stats" aria-label="Route statistics">
          <div className="sg-stat"><strong>{replay?.cost ?? 0}</strong><span>LINK COST ↓</span></div>
          <div className="sg-stat"><strong>{Number(Boolean((replay?.relays ?? 0) & 1)) + Number(Boolean((replay?.relays ?? 0) & 2))}<small>/2</small></strong><span>RELAYS</span></div>
          <div className="sg-stat"><strong>{path.length - 1}<small>/{MAX_MOVES}</small></strong><span>MOVES</span></div>
        </div>
        <div className="sg-board" role="group" aria-label="Routing board" aria-describedby={`${id}-controls`}
          onKeyDown={event => {
            if (!playing || complete || event.altKey || event.ctrlKey || event.metaKey) return;
            const offsets: Record<string, number> = { ArrowUp: -4, ArrowDown: 4, ArrowLeft: -1, ArrowRight: 1 };
            if (event.key in offsets) { event.preventDefault(); move(current + offsets[event.key]); }
          }}>
          <svg viewBox="0 0 400 400" aria-hidden="true">{board?.edges.map(edge => {
            const x1 = 50 + edge.from % 4 * 100; const y1 = 50 + Math.floor(edge.from / 4) * 100;
            const x2 = 50 + edge.to % 4 * 100; const y2 = 50 + Math.floor(edge.to / 4) * 100;
            const used = path.some((node, index) => index > 0 && ((node === edge.from && path[index - 1] === edge.to) || (node === edge.to && path[index - 1] === edge.from)));
            return <g key={`${edge.from}-${edge.to}`}><line x1={x1} y1={y1} x2={x2} y2={y2} data-used={used} /><rect x={(x1 + x2) / 2 - 12} y={(y1 + y2) / 2 - 11} width="24" height="22" rx="4" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2}>{edge.cost}</text></g>;
          })}</svg>
          {Array.from({ length: 16 }, (_, node) => {
            const relayIndex = RELAYS.indexOf(node as 6 | 9);
            const label = node === 0 ? 'TX' : node === 15 ? 'RX' : relayIndex === 0 ? 'A' : relayIndex === 1 ? 'B' : nodeLabel(node);
            const link = next.find(item => item.node === node);
            const enabled = playing && !complete && Boolean(link) && (node !== 15 || replay?.relays === 3);
            return <button type="button" key={node} ref={element => { nodes.current[node] = element; }} className="sg-node"
              style={{ left: `${12.5 + node % 4 * 25}%`, top: `${12.5 + Math.floor(node / 4) * 25}%` }}
              data-role={relayIndex >= 0 ? 'relay' : node === 0 || node === 15 ? 'terminal' : 'node'}
              data-current={current === node} data-visited={path.includes(node)} aria-current={current === node ? 'location' : undefined}
              tabIndex={playing && !complete && current === node ? 0 : -1} aria-disabled={!enabled && !(playing && !complete && current === node)}
              aria-label={`${nodeLabel(node)}${label !== nodeLabel(node) ? `, ${relayIndex >= 0 ? 'relay ' : ''}${label}` : ''}${path.includes(node) ? ', visited' : ''}${link ? `, link cost ${link.cost}` : ''}${node === 15 && replay?.relays !== 3 ? ', requires both relays' : ''}`}
              onClick={() => move(node)}>{label}</button>;
          })}
        </div>
        <div className="sg-legend"><span>TX → source</span><span><b>A · B</b> → relays</span><span>RX → receiver</span></div>
        <p className="sg-subtle" id={`${id}-controls`} style={{ marginTop: 12 }}>Tap a connected node, or use arrow keys on the board to move. Tab to the link buttons below for their costs. Undo is free.</p>
        {playing && !complete && <div className="sg-next" aria-label="Available links">{next.map(link => <button type="button" className="sg-button sg-secondary" key={link.node} disabled={link.node === 15 && replay?.relays !== 3} onClick={() => move(link.node)}>{link.node === 15 ? 'RX' : nodeLabel(link.node)} · {link.cost} cost</button>)}</div>}
        <div className="sg-actions"><button type="button" className="sg-button" onClick={start} disabled={!board}>{!playing ? 'Start routing' : complete ? 'Run it again ↗' : 'Restart route'}</button><button type="button" className="sg-button sg-secondary" disabled={!playing || complete || path.length <= 1} onClick={undo}>Undo move</button></div>
        <p className="sg-status" role="status" aria-live="polite" aria-atomic="true">{message}</p>
        <details><summary>Route log &amp; scoring</summary><p className="sg-route">{path.map(nodeLabel).join(' → ')}</p><p>Each move adds its link cost. Visit both relays in either order; revisiting nodes is allowed. RX ends the run. The best possible route earns 1,000 points; each extra cost subtracts 20, down to zero. Lower cost ranks first, and equal costs share a place. No speed bonus.</p><p>One puzzle per UTC day. A run stays on its original day until you restart. Up to 64 moves; undo or restart if you run out.</p></details>
      </div>
      <aside className="sg-aside" aria-label="Results and leaderboard">
        {complete && board && <div className="sg-card">
          <p className="sg-kicker">Packet delivered</p><h3 ref={resultHeading} tabIndex={-1}>{replay?.cost === optimum ? 'An optimal route.' : 'Connected. Now tune it.'}</h3>
          <div className="sg-result">{scoreReplay(board, path).score}<span className="sg-subtle"> / 1,000</span></div>
          <p className="sg-subtle">Your cost: {replay?.cost}. Best possible: {optimum}. {replay?.cost === optimum ? 'Every link earned its place.' : `${(replay?.cost ?? 0) - optimum} cost to trim on your next run.`}</p>
          <form className="sg-save" onSubmit={save}><label htmlFor={`${id}-name`}>Callsign · 3–12 letters or numbers</label><input id={`${id}-name`} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={12} minLength={3} required pattern="[A-Za-z0-9]{3,12}" value={name} onChange={event => setName(event.target.value)} disabled={saved} /><button className="sg-button" style={{ marginTop: 10 }} disabled={saved} type="submit">{saved ? 'Result recorded' : 'Save local result'}</button></form>
        </div>}
        <div className="sg-card"><span className="sg-badge">THIS BROWSER ONLY</span><h3>Local leaderboard</h3><p className="sg-subtle">Today’s best routes. One best result per callsign.</p>
          {ranking.length === 0 ? <div className="sg-empty">No runs saved for this puzzle yet.<br />The first signal could be yours.</div> : <table><caption>Puzzle {day} · lower cost wins, ties share a place</caption><thead><tr><th scope="col">#</th><th scope="col">Callsign</th><th scope="col">Cost</th><th scope="col">Points</th></tr></thead><tbody>{ranking.map((run, index) => <tr key={run.id} data-own={saved && run.name === name}><td>{places[index]}</td><td>{run.name}</td><td>{run.cost}</td><td>{run.score}</td></tr>)}</tbody></table>}
          <p className="sg-subtle">{storageNote} Local results can be edited or cleared by the browser owner.</p>
        </div>
        <SharedRankings day={day} path={path} complete={complete} callsign={saved ? name : undefined} />
      </aside>
    </div>
    <footer className="sg-footer"><span className="sg-kicker">Built for curious minds, not fast thumbs.</span><span className="sg-subtle">Signal Run / v1</span></footer>
  </section>;
}
