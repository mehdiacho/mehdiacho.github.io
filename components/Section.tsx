import React from 'react';

export type SectionTheme = 'brut' | 'riso' | 'blueprint' | 'soft' | 'swiss' | 'ledger';

/** Three ways of setting a section's head. Nothing is laid out twice. */
export type SectionVariant = 'rail' | 'banner' | 'inline';

interface SectionProps {
  id: string;
  /** The two-digit index. Shown as a mark, not as a caption. */
  number: string;
  title: React.ReactNode;
  /** One line under the heading. Optional — not every section needs one. */
  standfirst?: string;
  /** Which palette and geometry the whole section switches to. */
  theme: SectionTheme;
  variant?: SectionVariant;
  children: React.ReactNode;
}

/**
 * The section shell.
 *
 * It does three things: it paints the theme (which retints every utility
 * inside it, see index.css §2), it spans the full width of the screen with
 * no max-width anywhere, and it sets the heading in one of three ways so no
 * two consecutive sections open the same.
 */
const Section: React.FC<SectionProps> = ({
  id,
  number,
  title,
  standfirst,
  theme,
  variant = 'rail',
  children,
}) => (
  <section
    id={id}
    data-theme={theme}
    aria-labelledby={`${id}-heading`}
    className="section-screen scroll-mt-20"
  >
    <div className="bleed pb-24 pt-12">
      {variant === 'rail' && (
        <div className="grid gap-x-14 gap-y-9 lg:grid-cols-[160px_minmax(0,1fr)]">
          <p className="lg:sticky lg:top-24 lg:self-start">
            <span className="numeral" aria-hidden="true">{number}</span>
          </p>

          <div>
            <h2 id={`${id}-heading`} className="h-section max-w-[16ch] text-ink">
              {title}
            </h2>
            {standfirst && (
              <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
                {standfirst}
              </p>
            )}
            <div className="mt-12">{children}</div>
          </div>
        </div>
      )}

      {variant === 'banner' && (
        <>
          <div className="grid items-end gap-x-16 gap-y-7 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div>
              <span className="numeral" aria-hidden="true">{number}</span>
              <h2 id={`${id}-heading`} className="h-section mt-7 text-ink">
                {title}
              </h2>
            </div>
            {standfirst && (
              <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft lg:pb-3">
                {standfirst}
              </p>
            )}
          </div>
          <div className="mt-14">{children}</div>
        </>
      )}

      {variant === 'inline' && (
        <>
          <div className="flex flex-wrap items-baseline gap-x-7 gap-y-4">
            <span className="label pt-1 text-accent" aria-hidden="true">{number}</span>
            <h2 id={`${id}-heading`} className="h-section max-w-[22ch] text-ink">
              {title}
            </h2>
          </div>
          {standfirst && (
            <p className="mt-7 max-w-[62ch] border-t border-rule pt-7 text-lg leading-relaxed text-ink-soft">
              {standfirst}
            </p>
          )}
          <div className="mt-12">{children}</div>
        </>
      )}
    </div>
  </section>
);

export default Section;
