import React from 'react';

import { PROFILE, PROCESS } from '../constants';
import {
  CaliperMeasuring,
  Crosshair,
  StepMeasure,
  StepDraw,
  StepModel,
  StepPrint,
} from './Drawings';

const STEP_DRAWINGS = [StepMeasure, StepDraw, StepModel, StepPrint];

/**
 * The top of the sheet.
 *
 * The h1 is the sentence the whole site is trying to rank for, written as a
 * sentence rather than as a slogan. The title block beside it is the drawing
 * convention it borrows from — the facts a client would otherwise have to
 * hunt for, in a fixed place.
 */
const Hero: React.FC = () => (
  <section id="top" className="border-b border-rule">
    <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="label text-red">
            {PROFILE.location} · {PROFILE.statusSub}
          </p>

          <h1 className="font-display mt-5 text-[clamp(2.3rem,6.2vw,4.6rem)] font-[200] leading-[1.02] tracking-[-0.035em] text-ink">
            {/* Spelled "and", not "&" — Grotesk's ampersand is a decorative
                form that a stranger reads as a typo at headline size. */}
            CAD modeling, 3D printing and{' '}
            <span className="font-bold">web development</span> in Gaborone,
            Botswana.
          </h1>

          <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
            {PROFILE.bioSub}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="border-2 border-ink bg-ink px-6 py-3 label text-paper transition-colors hover:border-blue hover:bg-blue"
            >
              Start a project
            </a>
            <a
              href="#cad"
              className="border-2 border-ink px-6 py-3 label text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              See the work
            </a>
          </div>

          <div className="dimline mt-12 pt-2.5">
            <span className="label text-ink-faint">
              Measure → Draw → Model → Print
            </span>
          </div>
        </div>

        {/* The drawing and the title block, stacked. On a phone the drawing
            goes first — it is the thing worth seeing at that size. */}
        <div className="flex flex-col gap-7">
          <CaliperMeasuring className="w-full text-ink" />

          <dl className="ticked border-2 border-ink bg-paper-lift">
            {[
              ['Based in', PROFILE.location],
              ['Coordinates', PROFILE.coordinates],
              ['Works on', '3D / CAD / Web'],
              ['Prints in', 'PETG, PLA'],
              ['Status', PROFILE.statusSub],
            ].map(([term, value], index, all) => (
              <div
                key={term}
                className={`flex items-baseline justify-between gap-5 px-4 py-2.5 ${
                  index === all.length - 1 ? '' : 'border-b border-rule-soft'
                }`}
              >
                <dt className="label text-ink-faint">{term}</dt>
                <dd className="font-label text-[12px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>

    {/* How the work goes. Four drawings and four short lines — this is the
        clearest answer to "what do you actually do". */}
    <div className="border-t border-rule bg-paper-lift/60">
      <ol className="mx-auto grid max-w-[1180px] list-none grid-cols-1 gap-px px-5 py-0 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {PROCESS.map((item, index) => {
          const Drawing = STEP_DRAWINGS[index];
          return (
            <li
              key={item.step}
              className="flex gap-4 border-b border-rule-soft py-7 pr-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <Drawing className="h-14 w-14 shrink-0 text-blue" />
              <div>
                <p className="label text-ink-faint">{item.step}</p>
                <h2 className="font-display mt-1 text-lg font-bold tracking-tight text-ink">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {item.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>

    {/* A quiet local-SEO note that is also just true. */}
    <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-6 sm:px-8">
      <Crosshair className="h-10 w-10 shrink-0 text-ink-faint" />
      <p className="text-sm text-ink-soft">
        Working from Gaborone, for clients anywhere in Botswana. Most jobs start
        with a photo and a couple of measurements sent over.
      </p>
    </div>
  </section>
);

export default Hero;
