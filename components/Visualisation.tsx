import React from 'react';

import { IsometricDesk } from './Drawings';

/**
 * Desk Twin, which is a different kind of 3D work from the printed parts —
 * nothing here gets made, it gets looked at. It lives on its own subdomain,
 * so this block is the hand-off.
 */
const Visualisation: React.FC = () => (
  <div className="block-hard grid items-center gap-10 p-7 lg:grid-cols-2 lg:p-10">
    <IsometricDesk className="w-full text-ink" />

    <div>
      <h3 className="font-display text-[clamp(1.4rem,3vw,2.1rem)] font-bold leading-tight tracking-tight text-ink">
        A room, rebuilt from its measurements
      </h3>

      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        Desk Twin is my actual desk, measured and rebuilt in the browser. The
        whole scene is driven off a list of numbers, so changing one of them
        redraws everything. I built it to try layouts without moving any
        furniture, which I was doing far too often.
      </p>

      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        It works the same way for a room, a shop floor or a stand. Nothing to
        install, it just runs.
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
