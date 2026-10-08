import React from 'react';

import { IsometricDesk } from './Drawings';

const POINTS = [
  ['Driven by numbers', 'The whole scene is built from a list of measurements. Change one and it redraws.'],
  ['Nothing to install', 'It opens in a browser, on a phone as well as a laptop.'],
  ['Works on any room', 'A desk, a shop floor, a stand at a trade fair. Same idea, different numbers.'],
];

/**
 * Desk Twin — a different kind of 3D work from the printed parts, because
 * nothing here gets made, it gets looked at.
 *
 * This is the one section on the site with rounded corners and a soft
 * shadow. It is a thing you play with rather than a drawing you read, and it
 * felt wrong dressed in the same hard rules as the rest.
 */
const Visualisation: React.FC = () => (
  <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
    <div className="panel flex items-center justify-center p-10 lg:p-14">
      <IsometricDesk className="w-full max-w-[520px] text-ink" />
    </div>

    <div className="panel flex flex-col p-10 lg:p-14">
      <h3 className="font-display text-[clamp(1.7rem,3.4vw,2.8rem)] font-bold leading-[1.02] tracking-tight text-ink">
        A room, rebuilt from its measurements
      </h3>

      <p className="mt-6 text-lg leading-relaxed text-ink-soft">
        Desk Twin is my actual desk, measured and rebuilt in the browser. I
        made it to try layouts without moving any furniture, which I was doing
        far too often.
      </p>

      <ul className="mt-9 list-none space-y-5 p-0">
        {POINTS.map(([title, detail]) => (
          <li key={title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
            />
            <p className="m-0 text-base leading-relaxed text-ink-soft">
              <strong className="font-bold text-ink">{title}.</strong> {detail}
            </p>
          </li>
        ))}
      </ul>

      <a
        href="https://v2.mehdiacho.tech"
        className="btn mt-12 self-start"
      >
        Open Desk Twin &rarr;
      </a>
    </div>
  </div>
);

export default Visualisation;
