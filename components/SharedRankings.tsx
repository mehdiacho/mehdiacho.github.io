import React, { useEffect, useRef, useState } from 'react';
import { sharedRanks } from '../lib/signal-game';
import { loadRankings, publishRun, SIGNAL_API, SIGNAL_PREVIEW } from '../lib/signal-rankings';
import type { SharedBoard } from '../lib/signal-rankings';

/** `callsign` is the name the player saved locally, if any; publishing uses it only when they choose to. */
export default function SharedRankings({ day, path, complete, callsign }: { day: string; path: number[]; complete: boolean; callsign?: string }) {
  const [board, setBoard] = useState<SharedBoard | null>(null);
  const runs = board?.runs ?? null;
  const [useName, setUseName] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const generation = useRef(0);
  useEffect(() => { generation.current++; setSubmitted(false); setBoard(null); setMessage(''); setBusy(false); }, [day, path]);
  async function refresh(publish = false) {
    const currentGeneration = generation.current;
    setBusy(true); setMessage('');
    try {
      if (publish) {
        const alias = await publishRun(day, path, useName ? callsign : undefined);
        if (generation.current !== currentGeneration) return;
        setSubmitted(true); setMessage(`Published as ${alias}. Your best route is kept.`);
      }
      const results = await loadRankings(day);
      if (generation.current === currentGeneration) setBoard(results);
    } catch (error) { if (generation.current === currentGeneration) setMessage(error instanceof Error ? error.message : 'Rankings could not load. Please retry.'); }
    finally { if (generation.current === currentGeneration) setBusy(false); }
  }
  if (!SIGNAL_API) return <div className="sg-card"><p className="sg-kicker">Public rankings / offline</p><h3 style={{ marginTop: 6 }}>A shared board comes next.</h3><p className="sg-subtle">Public rankings are not connected yet. This game sends no scores or callsigns to a server. Only your real saved runs appear here.</p></div>;
  return <div className="sg-card"><p className="sg-kicker">{SIGNAL_PREVIEW ? 'Local service / preview' : 'Across browsers'}</p><h3 style={{ marginTop: 6 }}>{SIGNAL_PREVIEW ? 'Preview rankings' : 'Visitor leaderboard'}</h3><p className="sg-subtle">{SIGNAL_PREVIEW ? 'Testing the shared service on this computer. These are not public rankings.' : 'Today’s best routes, checked by the server. Equal costs share a place, so there’s no prize for playing first.'}</p>
    <div className="sg-actions"><button className="sg-button sg-secondary" disabled={busy || !day} onClick={() => refresh()}>{busy ? 'Working…' : runs ? 'Refresh rankings' : 'Load rankings'}</button>{complete && <button className="sg-button" disabled={busy || submitted} onClick={() => refresh(true)}>{submitted ? 'Published' : 'Publish this route'}</button>}</div>
    {complete && callsign && <label className="sg-check"><input type="checkbox" checked={useName} disabled={busy || submitted} onChange={event => setUseName(event.target.checked)} /> Show {callsign} on the public board</label>}
    {complete && <p className="sg-subtle">Publishing sends your route and a random browser identifier to a Cloudflare Worker, which checks the route and stores only a hash of the identifier with your score. The board shows your callsign if you tick the box above, and a generated alias otherwise. Callsigns go through a word filter. Results are kept for 30 days. For rate limiting, your network address is hashed with the hour; only that hash is kept, for up to two hours.</p>}
    {runs && (runs.length ? <><table><caption>{day} / lower cost wins, ties share a place</caption><thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Cost</th><th scope="col">Points</th></tr></thead><tbody>{(() => { const ranks = sharedRanks(runs.map(run => run.cost)); return runs.map((run, i) => <tr key={`${run.alias}-${i}`}><td>{ranks[i]}{ranks.filter(rank => rank === ranks[i]).length > 1 ? '=' : ''}</td><td>{run.alias}</td><td>{run.cost}</td><td>{run.score}</td></tr>); })()}</tbody></table>{(board?.tiedForFirst ?? 0) > 1 && <p className="sg-subtle">{board!.tiedForFirst} players share first place today.</p>}</> : <p className="sg-empty">No published routes for this puzzle yet.</p>)}
    <p role="status" className="sg-subtle">{message}</p>
  </div>;
}
