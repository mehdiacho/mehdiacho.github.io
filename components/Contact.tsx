import React from 'react';

import { PROFILE } from '../constants';

/**
 * The bookend. It is dressed the same as the hero on purpose: the page opens
 * in black and acid and closes there, and everything in between is a detour
 * through the work.
 */
const Contact: React.FC = () => (
  <section
    id="contact"
    data-theme="brut"
    aria-labelledby="contact-heading"
    className="scroll-mt-20 border-t-[4px] border-ink"
  >
    <div className="bleed py-20">
      <p className="label text-accent">Gaborone, Botswana</p>

      {/* Broken by hand rather than left to wrap. At this size the line
          always runs over, and left to itself it drops the "it" onto a row
          of its own, which looks like a mistake rather than a decision. */}
      <h2
        id="contact-heading"
        className="font-pilow mt-6 text-[clamp(3rem,13vw,11rem)] leading-[.85] text-ink"
      >
        <span className="block">Let&rsquo;s</span>
        <span className="block">build it</span>
      </h2>

      <div className="mt-14 grid gap-12 border-t-[3px] border-ink pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <p className="m-0 max-w-[48ch] text-xl leading-relaxed text-ink-soft">
          Send a photo of the part, a rough idea, or the website you wish you
          had. A couple of measurements is usually enough to tell you whether
          it is worth doing and what it would take.
        </p>

        <div>
          <div className="flex flex-wrap items-center gap-4">
            <a href={`mailto:${PROFILE.email}`} className="btn">
              Email me
            </a>
            <a href={PROFILE.socials.github} className="btn btn-hollow">
              GitHub
            </a>
            <a href={PROFILE.socials.linkedin} className="btn btn-hollow">
              LinkedIn
            </a>
          </div>

          <p className="mt-8 font-label text-[15px] text-accent">{PROFILE.email}</p>
        </div>
      </div>
    </div>
  </section>
);

export default Contact;
