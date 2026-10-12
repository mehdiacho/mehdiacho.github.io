import React from 'react';
import { CAD_STORIES } from '../cad-stories';
import InlineModel from './InlineModel';
export default function Work3D() {
 return <><div className="grid grid-cols-1 gap-8 lg:grid-cols-2">{CAD_STORIES.map(story => <article className="panel ticked overflow-hidden" key={story.id}>
   <InlineModel src={story.model} poster={story.poster} alt={story.alt} />
   <div className="p-6"><p className="label text-accent">{story.status}</p><h3 className="font-display text-3xl mt-4">{story.title}</h3><p className="mt-4 leading-relaxed text-ink-soft">{story.intro}</p><a className="cad-story-link mt-6 inline-block" href={`/models/${story.slug}/`}>The story and blueprint →</a></div>
 </article>)}</div><p className="mt-9 leading-relaxed max-w-[70ch]">These are my own projects, and I’m still learning through them. Have something similar in mind? <a className="underline underline-offset-4" href="/cad-modeling-botswana/">Here’s how I approach CAD requests</a>, or <a className="underline underline-offset-4" href="/models/">browse the model notebook</a>.</p></>;
}
