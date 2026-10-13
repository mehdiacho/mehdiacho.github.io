import React from 'react';
import Skills from './Skills';
import Timeline from './Timeline';
export default function Background() {
  return <><div className="background-notes"><div><p className="label text-accent">The person behind the tabs</p><h3>Ideas are usually how it starts.</h3></div><div><p>I love building software. Research became another way to follow that curiosity: take a question seriously, try something, then work out whether it actually helped.</p><p>I’m interested in work that makes it out of a notebook and into someone’s life. That can be a useful tool, a better explanation, or a small fix for an everyday problem.</p><p>There are plenty of unfinished threads here. This site is a place to keep the work, the questions, and a little of what I do away from them.</p></div></div><h3 className="label text-accent mb-5">How I got here</h3><Timeline /><details className="background-toolkit"><summary>Tools I reach for <span aria-hidden="true">＋</span></summary><Skills /></details></>;
}
