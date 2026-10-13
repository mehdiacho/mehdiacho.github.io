import React from 'react';
import Skills from './Skills';
import Timeline from './Timeline';

const facts = [
  ['Based in', 'Gaborone, Botswana'],
  ['Studying', 'MSc Computer Science, BIUST'],
  ['Researching', 'Graph networks on EEG'],
  ['Open to', 'Software and machine learning work, and people who want to build one of the ideas here'],
];

export default function Background() {
  return <>
    <div className="background-story">
      <div className="background-side">
        <p className="label text-accent">The person behind the tabs</p>
        <h3>Ideas are usually how it starts.</h3>
        <dl className="background-facts">{facts.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
      </div>
      <div className="background-body">
        <p>I studied computer science at BIUST and stayed on for an MSc. In between, I ran the university’s Innovation Club for a year and had my first proper job, an internship at Spectrum Analytics, doing AI integration work with teams that hadn’t built with it before.</p>
        <p>I love building software, and I found a love for research I didn’t expect. Research is a different kind of building: you take a question seriously, try something, and then work out whether it actually helped.</p>
        <p>My strength is ideas, and I have too many of them. I’ve learnt that I need good people around me to turn them into something. This site keeps the work, the open questions and the unfinished threads in one place, along with a little of what I do away from them.</p>
        <p><a className="background-link" href="#hobbies">What I do off the clock ↑</a></p>
      </div>
    </div>
    <h3 className="label text-accent mb-5">How I got here</h3>
    <Timeline />
    <details className="background-toolkit"><summary>Tools I reach for <span aria-hidden="true">＋</span></summary><Skills /></details>
  </>;
}
