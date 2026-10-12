import React from 'react';
import { ABOUT } from '../constants';
import { CaliperMeasuring } from './Drawings';
import RoleWheel from './RoleWheel';

export default function Hero() {
  return <section id="top" data-theme="brut">
    <div className="bleed hero-personal">
      <div className="dimline flex justify-between gap-5 pt-3"><p className="label text-accent">Gaborone, Botswana</p><p className="label text-ink-soft">A few things I’m into</p></div>
      <div className="hero-composition">
        <div><h1 className="hero-name">I’m Mehdi<br />Acho.</h1><RoleWheel />
          <p className="hero-intro">I’m doing an MSc at BIUST and making things in between. Sometimes that means software, sometimes a replacement part for something I own. This is where I keep the projects, experiments and things I’m still figuring out.</p>
          <a className="hero-explore" href="#cad">Come have a look ↓</a>
        </div>
        <aside className="hero-note"><span className="label text-accent">Currently on the workbench</span><CaliperMeasuring className="w-full text-accent" /><p>A charger brace.<br />A replacement key shell.<br />A few fit tests to get right.</p><a href="/models/">Open the model notebook ↗</a></aside>
      </div>
      <div className="hero-longer"><p className="label text-accent">A little more about me</p><div className="grid gap-7 mt-7 md:grid-cols-2 xl:grid-cols-4">{ABOUT.map(paragraph => <p key={paragraph.slice(0,32)} className="leading-relaxed text-ink-soft">{paragraph}</p>)}</div></div>
    </div>
  </section>;
}
