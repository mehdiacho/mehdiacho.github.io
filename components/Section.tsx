import React from 'react';

export type SectionTheme = 'paper' | 'brut' | 'riso' | 'blueprint' | 'soft' | 'swiss' | 'ledger';

/** Three ways of setting a section's head. Nothing is laid out twice. */
export type SectionVariant = 'rail' | 'banner' | 'inline';

interface SectionProps {
  id: string;
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
        <div>
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
              <h2 id={`${id}-heading`} className="h-section text-ink">
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
