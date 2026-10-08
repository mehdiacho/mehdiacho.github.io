import React from 'react';

import { SectionRule } from './Drawings';

interface SectionProps {
  id: string;
  /** The two-digit index shown beside the heading, editorial style. */
  number: string;
  title: React.ReactNode;
  /** One line under the heading. Optional — not every section needs one. */
  standfirst?: string;
  children: React.ReactNode;
}

/**
 * The shared section frame: a dimension rule across the top, then a numbered
 * heading in the left column with the content beside it. Below the `lg`
 * breakpoint the two columns stack and the number sits above the heading.
 */
const Section: React.FC<SectionProps> = ({ id, number, title, standfirst, children }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
    <SectionRule className="h-4 w-full text-ink" />
    <div className="h-[3px] w-full bg-ink" aria-hidden="true" />

    <div className="mx-auto max-w-[1180px] px-5 pb-20 pt-10 sm:px-8">
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[150px_minmax(0,1fr)]">
        {/* The index is a mark, not a caption: solid ink with the number
            knocked out and an acid shadow behind it. */}
        <p className="lg:sticky lg:top-24 lg:self-start">
          <span className="numeral" aria-hidden="true">{number}</span>
        </p>

        <div>
          <h2
            id={`${id}-heading`}
            className="font-display max-w-[20ch] text-[clamp(1.7rem,4vw,2.9rem)] font-[200] leading-[1.05] tracking-[-0.03em] text-ink"
          >
            {title}
          </h2>
          {standfirst && (
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-ink-soft">
              {standfirst}
            </p>
          )}

          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  </section>
);

export default Section;
