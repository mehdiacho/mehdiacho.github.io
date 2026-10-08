import React from 'react';

import { TIMELINE } from '../constants';

/**
 * Where he has been. An editorial list rather than a decorated timeline —
 * four entries do not need a rail and a row of dots to be read in order.
 */
const Timeline: React.FC = () => (
  <ol className="list-none border-b border-rule-soft p-0">
    {TIMELINE.map((item) => (
      <li
        key={item.id}
        className="grid gap-x-8 gap-y-1 border-t border-rule-soft py-6 sm:grid-cols-[160px_minmax(0,1fr)]"
      >
        <p className="label pt-1 text-ink-faint">{item.period}</p>

        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">
            {item.role}
          </h3>
          <p className="label mt-1 text-blue">{item.company}</p>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
            {item.description}
          </p>
        </div>
      </li>
    ))}
  </ol>
);

export default Timeline;
