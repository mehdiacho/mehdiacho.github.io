import React from 'react';

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#cad', label: '3D & CAD' },
  { href: '#visualisation', label: 'Visualisation' },
  { href: '#software', label: 'Software' },
  { href: '#about', label: 'About' },
];

/**
 * The sheet's top edge. Thin, sticky, and the only part of the page that
 * sits on solid paper rather than on the grid — so it stays readable over
 * whatever is scrolling underneath it.
 */
const SiteHeader: React.FC = () => (
  <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
    <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3 sm:px-8">
      <a href="#top" className="font-mark text-lg tracking-[0.12em] text-ink">
        MEHDI ACHO
      </a>

      <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="label text-ink-soft transition-colors hover:text-blue"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a
        href="#contact"
        className="ml-auto border-2 border-ink bg-ink px-4 py-2 label text-paper transition-colors hover:bg-blue hover:border-blue"
      >
        Start a project
      </a>
    </div>
  </header>
);

export default SiteHeader;
