import React from 'react';

import { IsometricDesk } from './Drawings';

/**
 * Desk Twin, which is a different kind of 3D work from the printed parts —
 * nothing here gets made, it gets looked at. It lives on its own subdomain,
 * so this block is the hand-off.
 */
const Visualisation: React.FC = () => (
  <div className="grid items-center gap-10 border-2 border-ink bg-paper-lift p-7 lg:grid-cols-2 lg:p-10">
    <IsometricDesk className="w-full text-ink" />

    <div>
      <h3 className="font-display text-[clamp(1.4rem,3vw,2.1rem)] font-bold leading-tight tracking-tight text-ink">
        A room, rebuilt from its measurements
      </h3>

      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        Desk Twin is a model of a real workspace built entirely from a list of
        measurements. Change one number and the whole scene redraws itself, so
        you can try a layout before moving any furniture. It runs in a browser
        with nothing to install.
      </p>

      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        The same approach works for a room, a shop floor or a stand — anywhere
        it is cheaper to be wrong on screen than in the room.
      </p>

      <a
        href="https://v2.mehdiacho.tech"
        className="mt-7 inline-block border-2 border-ink bg-ink px-5 py-3 label text-paper transition-colors hover:border-blue hover:bg-blue"
      >
        Open Desk Twin →
      </a>
    </div>
  </div>
);

export default Visualisation;
