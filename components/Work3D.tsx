import React from 'react';
import { useCadEntries } from '../lib/prints';
import { CadVisual, entryHref, entryLinkText } from './CadPages';
export default function Work3D() {
 // The home page shows the prints I have written up; the notebook lists every print in the manifest.
 const entries = useCadEntries().filter(entry => entry.story);
 return <><div className="grid grid-cols-1 gap-8 lg:grid-cols-2">{entries.map(entry => <article className="panel ticked overflow-hidden" key={entry.id}>
   <CadVisual entry={entry} />
   <div className="p-6"><p className="label text-accent">{entry.status}</p><h3 className="font-display text-3xl mt-4">{entry.title}</h3><p className="mt-4 leading-relaxed text-ink-soft">{entry.story?.intro ?? entry.description}</p><a className="cad-story-link mt-6 inline-block" href={entryHref(entry)}>{entryLinkText(entry)}</a></div>
 </article>)}</div><p className="mt-9 leading-relaxed max-w-[70ch]">These are my own projects, and I’m still learning through them. Have something similar in mind? <a className="underline underline-offset-4" href="/cad-modeling-botswana/">Here’s how I approach CAD requests</a>, or <a className="underline underline-offset-4" href="/models/">browse the model notebook</a>.</p></>;
}
