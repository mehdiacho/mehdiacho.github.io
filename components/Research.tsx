import React from 'react';
import ProjectIdeas from './ProjectIdeas';

/** Papers the current study builds on. Real, public and linked, so a reader can check them. */
const reading = [
  { title: 'EEGNet: a compact convolutional network for EEG-based brain–computer interfaces', who: 'Lawhern et al., 2018', href: 'https://arxiv.org/abs/1611.07429', why: 'The CNN baseline. It treats the electrodes as rows in a grid.' },
  { title: 'Semi-supervised classification with graph convolutional networks', who: 'Kipf & Welling, 2017', href: 'https://arxiv.org/abs/1609.02907', why: 'The graph convolution the comparison is built around.' },
  { title: 'GNNExplainer: generating explanations for graph neural networks', who: 'Ying et al., 2019', href: 'https://arxiv.org/abs/1903.03894', why: 'One way to ask which connections a graph model actually used.' },
];

const fairTest = [
  ['Same data, two views', 'The CNN sees the channels as a flat grid. The graph model gets the electrodes as nodes, with edges for how they sit on the head.'],
  ['A fair fight', 'Both models need the same preprocessing, the same splits and the same training budget, or the comparison says more about the setup than the idea.'],
  ['Chance is a third', 'With three vowels, guessing gets one in three right. Every result has to be read against that, and against how much it varies between people.'],
];

export default function Research() {
  return <div className="research-stack">
    <div className="research-layout">
      <article className="research-current"><p className="label">MSc / BIUST / In progress</p><h3>What changes when the model sees a graph?</h3><p>My current research compares graph networks with convolutional models on EEG inner-speech data: recordings taken while someone silently imagines saying a vowel. The question is whether representing how the electrodes relate to each other helps, compared with the grid a CNN assumes.</p>
        <div className="research-figure" aria-label="Illustration: electrode connections compared with a grid"><svg viewBox="0 0 440 160" role="img"><title>Two representations of the same signal: a connected graph and a grid</title><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M40 80L90 25L150 40L175 110L100 140L40 80L150 40L100 140L90 25L175 110L40 80" />{[[40,80],[90,25],[150,40],[175,110],[100,140]].map(([x,y])=><circle key={x} cx={x} cy={y} r="7" fill="currentColor" />)}<path d="M210 80h35m-8-8l8 8-8 8" />{Array.from({length:16},(_,i)=><rect key={i} x={280+i%4*31} y={20+Math.floor(i/4)*31} width="24" height="24" opacity={.3+(i%3)*.3} />)}</g></svg><span>Relationships ↔ regular grids / conceptual illustration</span></div>
        <h4 className="research-subhead">What a fair comparison needs</h4>
        <dl className="research-method">{fairTest.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
        <p className="research-caveat">The comparison is ongoing. Results, evaluation splits and limitations will go here once they’re ready to share. Nothing on this page is a result yet.</p>
      </article>
      <aside className="research-questions"><p className="label">Questions I want to explore</p><h3>Beyond one more demo.</h3><ol><li><strong>What did the model learn?</strong><p>Show the important inputs, then test whether the explanation holds up when they change.</p></li><li><strong>When does it fail?</strong><p>Keep difficult cases visible. Compare against a simple baseline before adding complexity.</p></li><li><strong>Can someone reproduce it?</strong><p>Document the data, split, compute budget and evaluation, alongside a demo people can try.</p></li></ol></aside>
    </div>
    <div className="research-reading"><div><p className="label">Reading behind it</p><h3>Where the study starts from.</h3><p>Three papers I keep going back to. They’re other people’s work, linked so you can read them yourself. One of my own tools, <a href="#software">BibVerify</a>, checks reference lists like this one against the DOI registry.</p></div>
      <ol>{reading.map(paper => <li key={paper.href}><a href={paper.href} target="_blank" rel="noopener noreferrer">{paper.title} ↗</a><span>{paper.who}</span><p>{paper.why}</p></li>)}</ol>
    </div>
    <ProjectIdeas />
  </div>;
}
