import React from 'react';

import { PROFILE, PROCESS, ABOUT } from '../constants';
import {
  CaliperMeasuring,
  Crosshair,
  StepMeasure,
  StepDraw,
  StepModel,
  StepPrint,
} from './Drawings';

const STEP_DRAWINGS = [StepMeasure, StepDraw, StepModel, StepPrint];

const FACTS: [string, string][] = [
  ['Based in', PROFILE.location],
  ['Coordinates', PROFILE.coordinates],
  ['Works on', '3D / CAD / Web'],
  ['Prints in', 'PETG, PLA'],
  ['Status', PROFILE.statusSub],
];

/**
 * The top of the page, and an introduction before it is a pitch.
 *
 * Black ground, acid green, type set as large as it can go. The h1 is first
 * person on purpose: someone who searched his name should land on a person,
 * not on a service. It still carries every phrase the site is trying to rank
 * for, so nothing is given up for it.
 */
const Hero: React.FC = () => (
  <section id="top" data-theme="brut">
    <div className="bleed pb-16 pt-12 sm:pt-16">
      <div className="dimline flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-3 text-ink-faint">
        <p className="label text-accent">{PROFILE.location}</p>
        <p className="label">{PROFILE.statusSub}</p>
      </div>

      {/* As big as the screen will take it. Spelled "and", not "&" — the
          ampersand in this face is a decorative form that a stranger reads
          as a typo at headline size. */}
      <h1 className="font-display mt-9 max-w-[17ch] text-balance text-[clamp(2.6rem,7.6vw,8.5rem)] font-bold leading-[.93] tracking-[-.045em] text-ink">
        I&rsquo;m Mehdi Acho. I do{' '}
        <span className="text-accent">CAD modeling</span>, 3D printing and{' '}
        <span className="text-accent">web development</span> out of Gaborone.
      </h1>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="max-w-[56ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
            {PROFILE.bioSub}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#contact" className="btn">
              Send me a photo
            </a>
            <a
              href="#cad"
              className="font-label text-[13px] text-ink-soft underline decoration-rule underline-offset-[6px] transition-colors hover:text-accent"
            >
              or look at the work first &darr;
            </a>
          </div>
        </div>

        {/* The drawing and the title block. On a phone the drawing goes
            first, because at that size it is the thing worth seeing. */}
        <div className="flex flex-col gap-8">
          <CaliperMeasuring className="w-full text-accent" />

          <dl className="panel ticked m-0">
            {FACTS.map(([term, value], index) => (
              <div
                key={term}
                className={`flex items-baseline justify-between gap-5 px-5 py-3 ${
                  index === FACTS.length - 1 ? '' : 'border-b border-rule-soft'
                }`}
              >
                <dt className="label text-ink-faint">{term}</dt>
                <dd className="m-0 font-label text-[12px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>

    {/* His own words, unedited. This is the "about me" the page opens with,
        and it comes before any of the work. */}
    <div className="bleed pb-20">
      <div className="border-y-[3px] border-ink py-12">
        <p className="label text-accent">The longer version</p>

        <div className="mt-9 grid gap-x-16 gap-y-7 md:grid-cols-2 xl:grid-cols-4">
          {ABOUT.map((paragraph, index) => (
            <p
              key={paragraph.slice(0, 32)}
              className={`m-0 leading-relaxed ${
                index === 0
                  ? 'text-xl text-ink md:text-2xl xl:text-xl'
                  : 'text-base text-ink-soft'
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>

    {/* How the work actually goes. Four drawings and four short lines, which
        is the clearest answer to "what do you do". */}
    <div className="bleed border-t-[3px] border-ink pb-16">
      <ol className="grid list-none grid-cols-1 gap-x-12 gap-y-0 p-0 sm:grid-cols-2 xl:grid-cols-4">
        {PROCESS.map((item, index) => {
          const Drawing = STEP_DRAWINGS[index];
          return (
            <li
              key={item.step}
              className="flex gap-5 border-b border-rule py-8 xl:border-b-0"
            >
              <Drawing className="h-16 w-16 shrink-0 text-accent" />
              <div>
                <p className="label text-ink-faint">{item.step}</p>
                <h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-ink">
                  {item.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                  {item.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>

    {/* A quiet local line that is also just true. */}
    <div className="bleed flex items-center gap-5 border-t border-rule py-7">
      <Crosshair className="h-11 w-11 shrink-0 text-accent" />
      <p className="m-0 max-w-[70ch] text-base text-ink-soft">
        I work from Gaborone and take jobs anywhere in Botswana. Most of them
        start with a photo and two or three measurements.
      </p>
    </div>
  </section>
);

export default Hero;
