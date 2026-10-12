import React, { useState } from 'react';
import { CAD_STORIES } from '../cad-stories';
import InlineModel from './InlineModel';

export default function CadPages({ path }: { path: string }) {
  const story = CAD_STORIES.find(s => path === `/models/${s.slug}/`);
  const [view, setView] = useState<'model' | 'blueprint'>('model');
  return <div data-theme="blueprint" className="cad-document">
    <header className="cad-nav"><a href="/">← Mehdi Acho</a><a href="/models/">The model notebook</a><a href="/#contact">Say hello</a></header>
    <main className="bleed py-14">
      <p className="label text-accent">{story ? 'An object from my workbench' : 'Drawings, models and the bits that do not fit yet'}</p>
      <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-tight mt-5">{story?.title ?? 'The model notebook'}</h1>
      <p className="cad-intro">{story?.intro ?? 'Most of these started with something of mine that needed fixing. These pages keep the model next to the drawing, with notes on why I made it and what still needs testing.'}</p>
      {story ? <>
        <p className="label text-accent mb-7">{story.status}</p>
        <div className="cad-tabs" role="group" aria-label="Choose a view">
          <button aria-pressed={view === 'model'} onClick={() => setView('model')}>3D model</button>
          <button aria-pressed={view === 'blueprint'} onClick={() => setView('blueprint')}>Interactive blueprint</button>
        </div>
        {view === 'model' ? <InlineModel src={story.model} poster={story.poster} alt={story.alt} /> :
          <iframe className="blueprint-frame" title={`${story.title} — interactive measurement blueprint`} src={story.blueprint} sandbox="allow-scripts" />}
        <div className="cad-links"><a href={story.blueprint} target="_blank" rel="noopener">Open blueprint in its own tab ↗</a><a href={story.model} download>Download model (.glb)</a></div>
        <div className="cad-story">{story.sections.map(([title,text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}</div>
        <nav className="cad-links" aria-label="Other models">{CAD_STORIES.filter(s => s.id !== story.id).map(s => <a key={s.id} href={`/models/${s.slug}/`}>Next object: {s.title} →</a>)}</nav>
      </> : <div className="cad-index">{CAD_STORIES.map(s => <article key={s.id}>
        <InlineModel src={s.model} poster={s.poster} alt={s.alt} />
        <p className="label mt-6 text-accent">{s.status}</p><h2 className="font-display text-3xl mt-3">{s.title}</h2><p className="my-5 leading-relaxed">{s.intro}</p><a className="cad-story-link" href={`/models/${s.slug}/`}>The story and blueprint →</a>
      </article>)}</div>}
      <section className="cad-request"><h2>Have something similar?</h2><p>I model things for myself, and I’m open to looking at requests. Send me what you have in mind; I’ll let you know whether it’s something I can take on.</p><a href="mailto:mehdiacho@gmail.com">Write to me →</a></section>
    </main><footer className="cad-nav"><span>© {new Date().getFullYear()} Mehdi Acho</span><a href="/cad-modeling-botswana/">About CAD modeling in Botswana</a></footer>
  </div>;
}
