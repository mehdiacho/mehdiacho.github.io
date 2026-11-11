import React from 'react';
import ProjectIdeas from './ProjectIdeas';

/**
 * The research room names the fields and nothing more. The question, the
 * method and the reading list come back once the work is published.
 */
export default function Research() {
  return <div className="research-stack">
    <div className="research-layout">
      <article className="research-current"><p className="label">MSc / BIUST / In progress</p><h3>Graph networks on EEG.</h3><p>The fields: graph neural networks, EEG and brain signals, and explainability. I’ll share the rest once I’ve published.</p>
      </article>
      <aside className="research-questions"><p className="label">Questions I want to explore</p><h3>Beyond one more demo.</h3><ol><li><strong>What did the model learn?</strong><p>Show the important inputs, then test whether the explanation holds up when they change.</p></li><li><strong>When does it fail?</strong><p>Keep difficult cases visible. Compare against a simple baseline before adding complexity.</p></li><li><strong>Can someone reproduce it?</strong><p>Document the data, split, compute budget and evaluation, alongside a demo people can try.</p></li></ol></aside>
    </div>
    <ProjectIdeas />
  </div>;
}
