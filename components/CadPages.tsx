import React, { useState } from 'react';
import { useCadEntries, type CadEntry } from '../lib/prints';
import InlineModel from './InlineModel';

/** The model if there is one, else the render, else a note that it is a drawing so far. */
export function CadVisual({ entry, priority = false }: { entry: CadEntry; priority?: boolean }) {
  if (entry.model) return <InlineModel priority={priority} src={entry.model} poster={entry.poster} alt={entry.alt} />;
  return <div className="inline-model"><div className={`model-stage${entry.poster ? '' : ' drawing-only'}`}>
    {entry.poster ? <img src={entry.poster} alt={entry.alt} width="900" height="675" loading={priority ? 'eager' : 'lazy'} />
      : <p>No 3D model yet. This one is a drawing so far.</p>}
  </div></div>;
}

/** Where a card links: its page, or its GitHub folder if it was added upstream after this build. */
export const entryHref = (e: CadEntry) => e.hasPage ? `/models/${e.slug}/` : e.source;
export const entryLinkText = (e: CadEntry) => !e.hasPage ? 'Drawings on GitHub ↗' : e.story ? 'The story and blueprint →' : 'The model and drawings →';

export default function CadPages({ path }: { path: string }) {
  const entries = useCadEntries();
  const entry = entries.find(e => e.hasPage && path === `/models/${e.slug}/`);
  return <div data-theme="blueprint" className="cad-document">
    <header className="cad-nav"><a href="/">← Mehdi Acho</a><a href="/models/">The model notebook</a><a href="/#contact">Say hello</a></header>
    <main className="bleed py-14">
      <p className="label text-accent">{entry ? 'An object from my workbench' : 'Drawings, models and the bits that do not fit yet'}</p>
      <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-tight mt-5">{entry?.title ?? 'The model notebook'}</h1>
      <p className="cad-intro">{entry ? entry.story?.intro ?? entry.description : 'Most of these started with something of mine that needed fixing. These pages keep the model next to the drawing, with notes on why I made it and what still needs testing.'}</p>
      {entry ? <CadEntryPage entry={entry} others={entries.filter(e => e.id !== entry.id)} /> : <div className="cad-index">{entries.map(e => <article key={e.id}>
        <CadVisual entry={e} />
        <p className="label mt-6 text-accent">{e.status}</p><h2 className="font-display text-3xl mt-3">{e.title}</h2><p className="my-5 leading-relaxed">{e.story?.intro ?? e.description}</p>
        <a className="cad-story-link" href={entryHref(e)}>{entryLinkText(e)}</a>
      </article>)}</div>}
      <section className="cad-request"><h2>Have something similar?</h2><p>I model things for myself, and I’m open to looking at requests. Send me what you have in mind; I’ll let you know whether it’s something I can take on.</p><a href="mailto:mehdiacho@gmail.com">Write to me →</a></section>
    </main><footer className="cad-nav"><span>© {new Date().getFullYear()} Mehdi Acho</span><a href="/cad-modeling-botswana/">About CAD modeling in Botswana</a></footer>
  </div>;
}

function CadEntryPage({ entry, others }: { entry: CadEntry; others: CadEntry[] }) {
  const [view, setView] = useState<'model' | 'blueprint'>('model');
  const showBlueprint = !!entry.blueprint && (view === 'blueprint' || !entry.model);
  return <>
    <p className="label text-accent mb-7">{entry.status}</p>
    {entry.model && entry.blueprint && <div className="cad-tabs" role="group" aria-label="Choose a view">
      <button aria-pressed={view === 'model'} onClick={() => setView('model')}>3D model</button>
      <button aria-pressed={view === 'blueprint'} onClick={() => setView('blueprint')}>Interactive blueprint</button>
    </div>}
    {showBlueprint ? <iframe className="blueprint-frame" title={`${entry.title} — interactive measurement blueprint`} src={entry.blueprint} sandbox="allow-scripts" />
      : <CadVisual entry={entry} priority />}
    <div className="cad-links">
      {entry.blueprint && <a href={entry.blueprint} target="_blank" rel="noopener">Open blueprint in its own tab ↗</a>}
      {entry.model && <a href={entry.model} download>Download model (.glb)</a>}
      <a href={entry.source} target="_blank" rel="noopener">{entry.blueprint ? 'Source files on GitHub ↗' : 'Drawings and source files on GitHub ↗'}</a>
    </div>
    {entry.story && <div className="cad-story">{entry.story.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}</div>}
    <nav className="cad-links" aria-label="Other models">{others.map(e => <a key={e.id} href={entryHref(e)}>Next object: {e.title} {e.hasPage ? '→' : '↗'}</a>)}</nav>
  </>;
}
