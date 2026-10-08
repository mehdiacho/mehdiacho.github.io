import React from 'react';

import { TIMELINE } from '../constants';

/**
 * Where he has been. An editorial list rather than a decorated timeline —
 * four entries do not need a rail and a row of dots to be read in order.
 */
const Timeline: React.FC = () => (
  <ol className="list-none border-b-2 border-ink p-0">
    {TIMELINE.map((item) => (
      <li
        key={item.id}
        className="grid gap-x-10 gap-y-2 border-t-2 border-ink py-7 lg:grid-cols-[200px_minmax(0,22ch)_minmax(0,1fr)]"
      >
        <p className="label m-0 pt-1.5 text-ink-faint">{item.period}</p>

        <div>
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink">
            {item.role}
          </h3>
          <p className="label mt-1.5 text-accent">{item.company}</p>
        </div>

        <p className="m-0 max-w-[62ch] text-base leading-relaxed text-ink-soft">
          {item.description}
        </p>
      </li>
    ))}
  </ol>
);

export default Timeline;
