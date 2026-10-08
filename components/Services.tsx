import React from 'react';

import { SERVICES } from '../constants';
import { MarkCad, MarkWeb, MarkLearning } from './Drawings';

const MARKS = [MarkCad, MarkWeb, MarkLearning];

/**
 * What someone can hire him for.
 *
 * Not three identical cards. The standfirst says these are in the order he
 * wants to be hired for them, so the layout says it too: the first is wider,
 * printed the other way round, and set larger. Each one links to its own
 * crawlable page, which is where the long-form copy a crawler reads lives.
 */
const Services: React.FC = () => (
  <ul className="grid list-none grid-cols-1 gap-7 p-0 lg:grid-cols-[1.45fr_1fr_1fr]">
    {SERVICES.map((service, index) => {
      const Mark = MARKS[index];
      const lead = index === 0;

      return (
        <li
          key={service.name}
          className={`relative flex flex-col overflow-hidden ${
            lead ? 'panel-invert' : 'panel-lift'
          }`}
        >
          {/* The sheet number, printed large and pale and running off the
              corner, the way it sits on a riso poster rather than in a
              caption underneath. */}
          <span
            aria-hidden="true"
            className="font-display pointer-events-none absolute -right-4 -top-10 text-[9rem] font-bold leading-none text-accent/20"
          >
            {`0${index + 1}`}
          </span>

          <div className={`relative flex flex-1 flex-col ${lead ? 'p-9' : 'p-7'}`}>
            <Mark className={lead ? 'h-20 w-20 text-accent' : 'h-14 w-14 text-accent'} />

            <h3
              className={`font-display mt-7 font-bold leading-[1.03] tracking-tight text-ink ${
                lead ? 'text-[clamp(1.9rem,2.6vw,2.6rem)]' : 'text-2xl'
              }`}
            >
              {service.name}
            </h3>

            <p
              className={`mt-5 flex-1 leading-relaxed text-ink-soft ${
                lead ? 'text-lg' : 'text-base'
              }`}
            >
              {service.detail}
            </p>

            {service.href && (
              <a
                href={service.href}
                className="mt-8 inline-block self-start border-b-2 border-accent pb-1 font-label text-[12px] font-medium tracking-wide text-ink transition-colors hover:text-accent"
              >
                {service.linkText ?? 'More'} &rarr;
              </a>
            )}
          </div>
        </li>
      );
    })}
  </ul>
);

export default Services;
