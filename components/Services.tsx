import React from 'react';

import { SERVICES } from '../constants';
import { MarkCad, MarkWeb, MarkLearning } from './Drawings';

const MARKS = [MarkCad, MarkWeb, MarkLearning];

/**
 * What someone can hire him for, in the order he wants to be hired for it.
 *
 * Each one links to its own crawlable page — those pages carry the long-form
 * copy Google reads, and this grid is the way a visitor reaches them.
 */
const Services: React.FC = () => (
  <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
    {SERVICES.map((service, index) => {
      const Mark = MARKS[index];
      return (
        <li
          key={service.name}
          className="ticked flex flex-col border-2 border-ink bg-paper-lift p-6"
        >
          <Mark className="h-14 w-14 text-blue" />

          <h3 className="font-display mt-5 text-xl font-bold tracking-tight text-ink">
            {service.name}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
            {service.detail}
          </p>

          {service.href && (
            <a
              href={service.href}
              className="mt-5 inline-block border-b-2 border-blue pb-0.5 font-label text-[12px] font-medium tracking-wide text-ink transition-colors hover:text-blue"
            >
              {service.linkText ?? 'More'} →
            </a>
          )}
        </li>
      );
    })}
  </ul>
);

export default Services;
