import React from 'react';
import { useCadEntries } from '../lib/prints';
import { entryHref } from './CadPages';

/**
 * CAD is a hobby now, so the home page only points at the notebook. Renders,
 * not live viewers: the 3D models and drawings load on the model pages, where
 * someone has chosen to look at them.
 */
export default function Work3D() {
  const entries = useCadEntries();
  return <div className="model-shelf">
    <div className="model-shelf-copy">
      <p>When something of mine breaks and nobody sells the part, I measure it and model a new one. I don’t own a 3D printer, so a finished model and a tested part are two different milestones, and each page says which one it has reached.</p>
      <a className="cad-story-link" href="/models/">Open the model notebook →</a>
    </div>
    <ul className="model-shelf-items">{entries.slice(0, 4).map(entry => <li key={entry.id}>
      <a href={entryHref(entry)}>
        {entry.poster ? <img src={entry.poster} alt="" width="900" height="675" loading="lazy" decoding="async" /> : <span className="model-shelf-blank" aria-hidden="true">Drawing only</span>}
        <span className="model-shelf-title">{entry.title}</span>
        <span className="label">{entry.status}</span>
      </a>
    </li>)}</ul>
  </div>;
}
