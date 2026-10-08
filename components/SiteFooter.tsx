import React from 'react';

import { PROFILE } from '../constants';

const SERVICE_PAGES = [
  { href: '/3d-modeling-botswana/', label: '3D modeling in Gaborone' },
  { href: '/cad-modeling-botswana/', label: 'CAD modeling in Botswana' },
  { href: '/web-development-gaborone/', label: 'Web development in Gaborone' },
];

/**
 * The sheet's title block, at the bottom where a drawing puts it. Also the
 * only place the crawlable service pages are linked from every screen, so
 * they are reachable without scrolling to the right section.
 */
const SiteFooter: React.FC = () => (
  <footer className="border-t-[3px] border-ink bg-paper-lift">
    <div className="bleed grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="font-mark text-xl tracking-[0.12em] text-ink">MEHDI ACHO</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{PROFILE.role}</p>
      </div>

      <div>
        <h2 className="label text-ink-faint">Services</h2>
        <ul className="mt-3 list-none space-y-2 p-0">
          {SERVICE_PAGES.map((page) => (
            <li key={page.href}>
              <a
                href={page.href}
                className="text-sm text-ink-soft underline decoration-rule underline-offset-4 transition-colors hover:text-blue"
              >
                {page.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="label text-ink-faint">Elsewhere</h2>
        <ul className="mt-3 list-none space-y-2 p-0">
          <li>
            <a href="https://v2.mehdiacho.tech" className="text-sm text-ink-soft underline decoration-rule underline-offset-4 transition-colors hover:text-blue">
              Desk Twin
            </a>
          </li>
          <li>
            <a href={PROFILE.socials.github} className="text-sm text-ink-soft underline decoration-rule underline-offset-4 transition-colors hover:text-blue">
              GitHub
            </a>
          </li>
          <li>
            <a href={PROFILE.socials.linkedin} className="text-sm text-ink-soft underline decoration-rule underline-offset-4 transition-colors hover:text-blue">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="label text-ink-faint">Contact</h2>
        <p className="mt-3 text-sm text-ink-soft">
          <a href={`mailto:${PROFILE.email}`} className="underline decoration-rule underline-offset-4 transition-colors hover:text-blue">
            {PROFILE.email}
          </a>
        </p>
        <p className="mt-2 font-label text-[11px] text-ink-faint">
          {PROFILE.location}
          <br />
          {PROFILE.coordinates}
        </p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
