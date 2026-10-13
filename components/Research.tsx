import React from 'react';

export default function Research() {
  return <div className="research-layout">
    <article className="research-current"><p className="label">MSc / BIUST / In progress</p><h3>What changes when the model sees a graph?</h3><p>My current research compares graph networks with convolutional models on EEG inner-speech data. The question is whether representing electrode relationships as a graph helps, compared with a grid-based approach.</p>
      <div className="research-figure" aria-label="Illustration: electrode connections compared with a grid"><svg viewBox="0 0 440 160" role="img"><title>Two representations of the same signal: a connected graph and a grid</title><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M40 80L90 25L150 40L175 110L100 140L40 80L150 40L100 140L90 25L175 110L40 80" />{[[40,80],[90,25],[150,40],[175,110],[100,140]].map(([x,y])=><circle key={x} cx={x} cy={y} r="7" fill="currentColor" />)}<path d="M210 80h35m-8-8l8 8-8 8" />{Array.from({length:16},(_,i)=><rect key={i} x={280+i%4*31} y={20+Math.floor(i/4)*31} width="24" height="24" opacity={.3+(i%3)*.3} />)}</g></svg><span>Relationships ↔ regular grids / conceptual illustration</span></div>
      <p className="research-caveat">The comparison is ongoing. Results, evaluation splits and limitations will go here once they’re ready to share.</p>
    </article>
    <aside className="research-questions"><p className="label">Questions I want to explore</p><h3>Beyond one more demo.</h3><ol><li><strong>What did the model learn?</strong><p>Show the important inputs, then test whether the explanation holds up when they change.</p></li><li><strong>When does it fail?</strong><p>Keep difficult cases visible. Compare against a simple baseline before adding complexity.</p></li><li><strong>Can someone reproduce it?</strong><p>Document the data, split, compute budget and evaluation, alongside a demo people can try.</p></li></ol></aside>
  </div>;
}
