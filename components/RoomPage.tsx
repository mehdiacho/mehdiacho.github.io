import React from 'react';
import type { SectionTheme } from './Section';
import SiteFooter from './SiteFooter';

/**
 * The shell every room shares: the strip along the top (the mark going home,
 * the room's name, "Say hello"), a title ending in the room's coloured full
 * stop, and the same footer as the home page.
 */
export default function RoomPage({ name, theme, label, title, intro, texture, children }: {
  name: string;
  theme: SectionTheme;
  label: string;
  title: string;
  intro?: string;
  /** A CSS image for the room's signature texture, laid behind the title. */
  texture?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header data-theme="brut" className="room-topbar">
        <a href="/" className="font-mark" aria-label="Mehdi Acho, home">MA<i>.</i></a>
        <span className="label">{name}</span>
        <a href="/#contact" className="label">Say hello</a>
      </header>
      <main>
        <section data-theme={theme} aria-labelledby="room-heading" className={`section-screen room-sheet${texture ? ' has-tex' : ''}`} style={texture ? { '--room-tex': texture } as React.CSSProperties : undefined}>
          <div className="bleed pb-24 pt-14">
            <p className="label text-accent">{label}</p>
            <h1 id="room-heading" className="h-section mt-6 text-ink">{title}<i className="room-stop">.</i></h1>
            {intro && <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft">{intro}</p>}
            <div className="mt-14">{children}</div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
