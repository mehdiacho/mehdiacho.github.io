import React from 'react';

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#cad', label: '3D & CAD' },
  { href: '#visualisation', label: 'Visualisation' },
  { href: '#software', label: 'Software' },
  { href: '#about', label: 'About' },
];

/**
 * The top edge. Solid ink rather than a tinted paper bar, because the page
 * runs through six different grounds underneath it and a translucent header
 * would end up unreadable over at least two of them.
 */
const SiteHeader: React.FC = () => (
  <header
    data-theme="brut"
    className="sticky top-0 z-40 border-b-[3px] border-ink"
  >
    <div className="bleed flex items-center gap-x-5 py-3 md:gap-x-10 md:py-3.5">
      <a href="#top" className="font-mark whitespace-nowrap text-lg tracking-[0.12em] text-ink md:text-xl">
        MEHDI ACHO
      </a>

      <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="label text-ink-soft transition-colors hover:text-accent"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a
        href="#contact"
        className="btn ml-auto whitespace-nowrap px-3.5 py-2 md:px-5 md:py-2.5"
      >
        Start a project
      </a>
    </div>
  </header>
);

export default SiteHeader;
