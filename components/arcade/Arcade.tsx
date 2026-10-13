import React, { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react';
import { normalizeName, sharedRanks } from '../../lib/arcade/callsign';
import { GAMES, gameForWeek } from '../../lib/arcade/registry';
import { previousWeek, weekEnd, weekOf, weekRange } from '../../lib/arcade/week';
import { ARCADE_API, ARCADE_PREVIEW, loadChampions, loadWeek, publishRun } from '../../lib/arcade/api';
import type { Champion, WeekBoard } from '../../lib/arcade/api';
import { downloadCertificate } from './certificate';
import { SCREENS } from './games';

/** Dressed in whatever theme the surrounding Section sets (brut on the home page): only theme tokens below. */
const styles = `
.arcade{color:var(--color-ink);font-family:var(--font-body);line-height:1.5;text-align:left}
.arcade *{box-sizing:border-box}.arcade h2,.arcade h3,.arcade p,.arcade dl,.arcade dd{margin:0}
.arcade .ar-kicker{color:var(--color-accent)}
.arcade .ar-head{display:flex;flex-wrap:wrap;gap:12px 32px;align-items:end;justify-content:space-between;padding-bottom:20px;border-bottom:var(--panel-border) solid var(--panel-line)}
.arcade h2{font:700 clamp(34px,5vw,56px)/1.05 var(--font-display);letter-spacing:-.04em}.arcade .ar-pitch{max-width:56ch;margin-top:8px;color:var(--color-ink-soft)}
.arcade .ar-clock{font:600 13px/1.5 var(--font-label);text-align:right;color:var(--color-ink-soft)}.arcade .ar-clock strong{display:block;color:var(--color-ink);font-size:22px}
.arcade .ar-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,1fr);gap:32px;margin-top:24px}
.arcade .ar-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.arcade .ar-stat{border-left:3px solid var(--color-accent);padding-left:12px}.arcade .ar-stat strong{display:block;font:700 26px/1.2 var(--font-label)}.arcade .ar-stat small{font-size:14px;color:var(--color-ink-soft)}.arcade .ar-stat span{font:600 11px var(--font-label);letter-spacing:.1em;color:var(--color-ink-soft)}
.arcade .ar-stage{position:relative;overflow:hidden}.arcade .ar-placeholder{display:grid;place-items:center;aspect-ratio:1000/625;padding:24px;text-align:center;color:var(--color-ink-soft)}
.arcade .ar-canvas{display:block;width:100%;aspect-ratio:1000/625;touch-action:none;cursor:default;user-select:none;-webkit-user-select:none}.arcade .ar-canvas[data-playing=true]{cursor:crosshair}
.arcade .ar-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;text-align:center;background:rgba(20,22,25,.82);color:#f4f1e8}
.arcade .ar-overlay h3{font:700 clamp(22px,3.4vw,36px)/1.1 var(--font-display);letter-spacing:-.02em}.arcade .ar-overlay p{max-width:44ch;font-size:15px}
.arcade .ar-count{font:700 clamp(64px,12vw,120px)/1 var(--font-display);color:var(--color-accent);background:rgba(20,22,25,.45)}
.arcade .ar-big{font:700 clamp(44px,8vw,80px)/1 var(--font-label);color:var(--color-accent)}
.arcade .ar-metrics{display:grid;grid-template-columns:repeat(4,auto);gap:4px 22px;margin-top:4px}.arcade .ar-metrics dt{font:600 10px var(--font-label);letter-spacing:.12em;text-transform:uppercase;color:#aeab9f}.arcade .ar-metrics dd{font:700 20px var(--font-label)}
.arcade .btn{min-height:44px;cursor:pointer;touch-action:manipulation}.arcade .btn:disabled{opacity:.45;cursor:not-allowed}.arcade .ar-hall .btn{padding:8px 12px}
.arcade button:focus-visible,.arcade input:focus-visible{outline:3px solid var(--color-accent);outline-offset:3px}
.arcade .ar-toast{min-height:1.6em;margin-top:10px;font:600 13px var(--font-label);color:var(--color-accent)}
.arcade .ar-legend{display:flex;flex-wrap:wrap;gap:6px 18px;list-style:none;padding:0;margin:8px 0 6px;font:12px var(--font-label);color:var(--color-ink-soft)}.arcade .ar-legend b{color:var(--color-ink)}
.arcade .ar-subtle{color:var(--color-ink-soft);font-size:13px}
.arcade .ar-aside{display:flex;flex-direction:column;gap:24px;min-width:0}
.arcade .ar-card{padding:20px}.arcade .ar-card > * + *{margin-top:10px}
.arcade .ar-card h3{font:700 20px/1.2 var(--font-display)}
.arcade .ar-banner{border:var(--panel-border) solid var(--color-accent);padding:14px 16px;background:var(--color-paper-lift)}.arcade .ar-banner strong{color:var(--color-accent)}
.arcade table{border-collapse:collapse;width:100%;font-size:13px}.arcade caption{text-align:left;color:var(--color-ink-soft);font:12px var(--font-label);margin-bottom:6px}.arcade th,.arcade td{padding:8px 4px;border-bottom:1px solid var(--color-rule);text-align:left;font-variant-numeric:tabular-nums}.arcade th{font:400 11px var(--font-label);color:var(--color-ink-soft)}.arcade td:nth-child(2){font-family:var(--font-label);overflow-wrap:anywhere}.arcade td:last-child,.arcade th:last-child{text-align:right}
.arcade .ar-hall{list-style:none;padding:0}.arcade .ar-hall li{display:grid;grid-template-columns:auto 1fr auto;gap:4px 12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-rule)}.arcade .ar-hall .ar-week{font:700 13px var(--font-label);color:var(--color-accent)}.arcade .ar-hall .ar-who{font:700 15px var(--font-label);overflow-wrap:anywhere}.arcade .ar-hall .ar-what{grid-column:2;font-size:12px;color:var(--color-ink-soft)}.arcade .ar-hall button{grid-row:1/span 2;grid-column:3}
.arcade label{display:block;font-size:13px}.arcade input[type=text]{width:100%;min-height:44px;margin-top:6px;background:var(--color-paper);color:var(--color-ink);border:2px solid var(--panel-line);border-radius:var(--panel-radius);padding:10px;font:600 15px var(--font-label);letter-spacing:.08em;text-transform:uppercase}
.arcade .ar-check{display:flex;gap:10px;align-items:center}.arcade .ar-check input{width:20px;height:20px;accent-color:var(--color-accent)}
.arcade .ar-row{display:flex;flex-wrap:wrap;gap:8px}
@media(max-width:820px){.arcade .ar-layout{grid-template-columns:minmax(0,1fr)}.arcade .ar-metrics{grid-template-columns:repeat(2,auto)}.arcade .ar-clock{text-align:left}}
`;

const BEST_KEY = 'portfolio.arcade.best.v1';
const NAME_KEY = 'portfolio.arcade.callsign.v1';
const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* Private mode: this session only. */ } };

function timeLeft(week: string, now: number) {
  const ms = Math.max(0, weekEnd(week) - now);
  const days = Math.floor(ms / 86_400_000); const hours = Math.floor(ms / 3_600_000) % 24; const minutes = Math.floor(ms / 60_000) % 60;
  return days ? `${days}d ${hours}h left` : hours ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

export default function Arcade() {
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const [week, setWeek] = useState('');
  const [now, setNow] = useState(0);
  const game = gameForWeek(week || undefined);
  const { load, pitch } = SCREENS[game.id];
  // The game (and its canvas) is its own chunk, fetched only once the section is near the viewport.
  const Screen = useMemo(() => React.lazy(load), [load]);
  const [visible, setVisible] = useState(false);
  const [best, setBest] = useState(0);
  const [run, setRun] = useState<{ replay: unknown; score: number } | null>(null);
  const [name, setName] = useState('');
  const [showName, setShowName] = useState(true);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [board, setBoard] = useState<WeekBoard | null>(null);
  const [champions, setChampions] = useState<Champion[] | null>(null);
  const [mine, setMine] = useState<string[]>([]);

  useEffect(() => {
    const tick = () => { const at = Date.now(); setNow(at); setWeek(weekOf(new Date(at))); };
    tick();
    const timer = window.setInterval(tick, 30_000);
    setName(read(NAME_KEY) || '');
    try { setMine(JSON.parse(read(`${NAME_KEY}.aliases`) || '[]').filter((item: unknown) => typeof item === 'string')); } catch { /* Ignore damaged storage. */ }
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!week) return;
    try { setBest(Number(JSON.parse(read(BEST_KEY) || '{}')[`${week}:${game.id}`]) || 0); } catch { setBest(0); }
    setRun(null); setPublished(false); setMessage('');
  }, [week, game.id]);

  // The game, the scoreboard and the hall of fame load when the section comes into view, not with the page.
  useEffect(() => {
    if (!root.current) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect(); setVisible(true);
    }, { rootMargin: '300px' });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (visible && week && ARCADE_API) void refresh(); }, [visible, week]);

  async function refresh() {
    try {
      const [weekBoard, hall] = await Promise.all([loadWeek(week), loadChampions()]);
      setBoard(weekBoard); setChampions(hall);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The scoreboard could not load.'); }
  }

  function onRun(result: { replay: unknown; score: number }) {
    setRun(result); setPublished(false); setMessage('');
    if (result.score > best) {
      setBest(result.score);
      try { const all = JSON.parse(read(BEST_KEY) || '{}'); all[`${week}:${game.id}`] = result.score; write(BEST_KEY, JSON.stringify(all)); } catch { write(BEST_KEY, JSON.stringify({ [`${week}:${game.id}`]: result.score })); }
    }
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (!run || published) return;
    setBusy(true); setMessage('');
    try {
      let callsign: string | undefined;
      if (showName && name.trim()) { callsign = normalizeName(name); write(NAME_KEY, callsign); setName(callsign); }
      const result = await publishRun({ week, game: game.id, version: game.version, replay: run.replay, name: callsign });
      const aliases = [...new Set([result.alias, ...mine])].slice(0, 10); setMine(aliases); write(`${NAME_KEY}.aliases`, JSON.stringify(aliases));
      setPublished(true);
      setMessage(`Published as ${result.alias}. ${result.best > result.score ? `Your best this week is still ${result.best.toLocaleString('en-GB')}.` : 'New personal best this week.'}${result.place ? ` You are #${result.place} right now.` : ''}`);
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Publishing failed. Please retry.'); }
    finally { setBusy(false); }
  }

  const ranks = board ? sharedRanks(board.scores.map(row => row.score)) : [];
  const lastWeek = week ? previousWeek(week) : '';
  const lastChampions = champions?.filter(entry => entry.week === lastWeek) ?? [];
  const certificate = (entry: Champion) => downloadCertificate({ ...entry, title: GAMES[entry.game]?.title ?? entry.game }).catch(error => setMessage((error as Error).message));

  return <section className="arcade" aria-labelledby={`${id}-title`} ref={root}>
    <style>{styles}</style>
    <header className="ar-head">
      <div><p className="label ar-kicker">This week{week ? ` · ${week} · ${weekRange(week)}` : ''}</p><h2 id={`${id}-title`}>{game.title}</h2><p className="ar-pitch">{pitch}</p></div>
      {week && <p className="ar-clock">Board closes Sunday 23:59 UTC<strong>{timeLeft(week, now)}</strong>{best > 0 && <>Your best this week: {best.toLocaleString('en-GB')}</>}</p>}
    </header>
    {lastChampions.length > 0 && <div className="ar-banner" style={{ marginTop: 20 }} role="status">
      <p><strong>Last week’s champion{lastChampions.length > 1 ? 's' : ''}:</strong> {lastChampions.map(entry => `${entry.alias} (${entry.score.toLocaleString('en-GB')})`).join(', ')}.{' '}
        {lastChampions.some(entry => mine.includes(entry.alias)) ? 'That’s you. Your certificate is in the hall of fame below.' : 'Immortalised in the hall of fame.'}</p>
    </div>}
    <div className="ar-layout">
      <div>{week && visible
        ? <Suspense fallback={<div className="panel ar-placeholder">Loading {game.title}…</div>}><Screen key={`${week}:${game.id}`} week={week} onRun={onRun} /></Suspense>
        : <div className="panel ar-placeholder">{game.title} loads when you scroll here.</div>}</div>
      <aside className="ar-aside" aria-label="Scoreboard and hall of fame">
        {run && <form className="panel ar-card" onSubmit={publish}>
          <p className="label ar-kicker">Round over</p><h3>{run.score.toLocaleString('en-GB')} points</h3>
          {ARCADE_API ? <>
            <label>Callsign · 3–12 letters or numbers<input type="text" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={12} value={name} onChange={event => setName(event.target.value)} disabled={busy || published} /></label>
            <label className="ar-check"><input type="checkbox" checked={showName} disabled={busy || published} onChange={event => setShowName(event.target.checked)} /> Show my callsign on the public board</label>
            <button className="btn" type="submit" disabled={busy || published || run.score === 0}>{published ? 'Published' : busy ? 'Checking your run…' : 'Publish this score'}</button>
            <p className="ar-subtle">The server replays every box you drew and recomputes the score. It keeps your best score this week with a hash of a random browser id, and shows your callsign if you tick the box (otherwise a generated alias). Weekly scores are deleted after five weeks. Each week’s top score goes into the hall of fame and stays there.</p>
          </> : <p className="ar-subtle">The shared scoreboard is not connected on this build, so scores stay on this page.</p>}
        </form>}
        <div className="panel ar-card">
          <p className="label ar-kicker">{ARCADE_PREVIEW ? 'Local service / preview' : 'This week'}</p><h3>{ARCADE_PREVIEW ? 'Preview scoreboard' : 'Scoreboard'}</h3>
          {!ARCADE_API ? <p className="ar-subtle">Not connected on this build.</p>
            : !board ? <p className="ar-subtle">Loading scores…</p>
            : board.scores.length ? <table><caption>{board.week} · higher wins, ties share a place</caption><thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Score</th></tr></thead>
              <tbody>{board.scores.map((row, i) => <tr key={`${row.alias}-${i}`}><td>{ranks[i]}{ranks.filter(rank => rank === ranks[i]).length > 1 ? '=' : ''}</td><td>{row.alias}</td><td>{row.score.toLocaleString('en-GB')}</td></tr>)}</tbody></table>
            : <p className="ar-subtle">No scores yet this week. The top spot is open.</p>}
        </div>
        <div className="panel ar-card">
          <p className="label ar-kicker">Immortalised</p><h3>Hall of fame</h3>
          {!ARCADE_API ? <p className="ar-subtle">Not connected on this build.</p>
            : !champions ? <p className="ar-subtle">Loading champions…</p>
            : champions.length ? <ul className="ar-hall">{champions.map(entry => <li key={`${entry.week}-${entry.alias}`}>
                <span className="ar-week">{entry.week.slice(5)}</span><span className="ar-who">{entry.alias}</span>
                <span className="ar-what">{GAMES[entry.game]?.title ?? entry.game} · {entry.score.toLocaleString('en-GB')} · {entry.week.slice(0, 4)}</span>
                <button type="button" className="btn btn-hollow" onClick={() => certificate(entry)} aria-label={`Download ${entry.alias}’s certificate for ${entry.week}`}>Certificate</button>
              </li>)}</ul>
            : <p className="ar-subtle">Empty for now. The first champion is crowned when this week’s board closes on Sunday at 23:59 UTC.</p>}
        </div>
        <p className="ar-subtle" role="status" aria-live="polite">{message}</p>
      </aside>
    </div>
  </section>;
}
