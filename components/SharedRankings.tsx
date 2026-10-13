import React, { useEffect, useRef, useState } from 'react';
import { loadRankings, publishRun, SIGNAL_API, SIGNAL_PREVIEW } from '../lib/signal-rankings';
import type { SharedRun } from '../lib/signal-rankings';

export default function SharedRankings({ day, path, complete }: { day: string; path: number[]; complete: boolean }) {
  const [runs, setRuns] = useState<SharedRun[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const generation = useRef(0);
  useEffect(() => { generation.current++; setSubmitted(false); setRuns(null); setMessage(''); setBusy(false); }, [day, path]);
  async function refresh(publish = false) {
    const currentGeneration = generation.current;
    setBusy(true); setMessage('');
    try {
      if (publish) {
        const alias = await publishRun(day, path);
        if (generation.current !== currentGeneration) return;
        setSubmitted(true); setMessage(`Published as ${alias}. Your best route is kept.`);
      }
      const results = await loadRankings(day);
      if (generation.current === currentGeneration) setRuns(results);
    } catch (error) { if (generation.current === currentGeneration) setMessage(error instanceof Error ? error.message : 'Rankings could not load. Please retry.'); }
    finally { if (generation.current === currentGeneration) setBusy(false); }
  }
  if (!SIGNAL_API) return <div className="sg-card"><p className="sg-kicker">Public rankings / offline</p><h3 style={{ marginTop: 6 }}>A shared board comes next.</h3><p className="sg-subtle">Public rankings are not connected yet. This game sends no scores or callsigns to a server. Only your real saved runs appear here.</p></div>;
  return <div className="sg-card"><p className="sg-kicker">{SIGNAL_PREVIEW ? 'Local service / preview' : 'Across browsers'}</p><h3 style={{ marginTop: 6 }}>{SIGNAL_PREVIEW ? 'Preview rankings' : 'Visitor leaderboard'}</h3><p className="sg-subtle">{SIGNAL_PREVIEW ? 'Testing the shared service on this computer. These are not public rankings.' : 'Today’s best routes, checked by the server. No speed bonus.'}</p>
    <div className="sg-actions"><button className="sg-button sg-secondary" disabled={busy || !day} onClick={() => refresh()}>{busy ? 'Working…' : runs ? 'Refresh rankings' : 'Load rankings'}</button>{complete && <button className="sg-button" disabled={busy || submitted} onClick={() => refresh(true)}>{submitted ? 'Published' : 'Publish this route'}</button>}</div>
    {complete && <p className="sg-subtle">Publishing shares your route and a random browser identifier. The board displays a generated alias, never your local callsign. Results are kept for 30 days.</p>}
    {runs && (runs.length ? <table><caption>{day} / lower cost wins</caption><thead><tr><th scope="col">#</th><th scope="col">Alias</th><th scope="col">Cost</th><th scope="col">Points</th></tr></thead><tbody>{runs.map((run,i)=><tr key={run.alias}><td>{i+1}</td><td>{run.alias}</td><td>{run.cost}</td><td>{run.score}</td></tr>)}</tbody></table> : <p className="sg-empty">No published routes for this puzzle yet.</p>)}
    <p role="status" className="sg-subtle">{message}</p>
  </div>;
}
