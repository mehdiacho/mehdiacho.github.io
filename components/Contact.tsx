import React from 'react';

import { PROFILE } from '../constants';

/**
 * The one moment on the page that stops behaving like a drawing sheet: solid
 * ink, an offset shadow, and the display face used exactly once. Everything
 * above it is restrained so that this reads as the end of the argument.
 */
const Contact: React.FC = () => (
  <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-20">
    <div className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8">
      <div className="block-hard p-8 sm:p-12">
        <p className="label text-red">Gaborone, Botswana</p>

        <h2 id="contact-heading" className="mt-4">
          <span className="font-pilow block text-[clamp(2.6rem,9vw,6rem)] leading-[0.9] text-ink">
            Let&rsquo;s build it
          </span>
        </h2>

        <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ink-soft">
          Send a photo of the part, a rough idea, or the website you wish you
          had. A couple of measurements is usually enough to tell you whether it
          is worth doing and what it would take.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${PROFILE.email}`}
            className="border-2 border-ink bg-ink px-6 py-3.5 label text-paper transition-colors hover:border-blue hover:bg-blue"
          >
            Email me
          </a>
          <a
            href={PROFILE.socials.github}
            className="border-2 border-ink px-6 py-3.5 label text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            GitHub
          </a>
          <a
            href={PROFILE.socials.linkedin}
            className="border-2 border-ink px-6 py-3.5 label text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            LinkedIn
          </a>
        </div>

        <p className="mt-8 font-label text-[13px] text-ink-soft">
          {PROFILE.email}
        </p>
      </div>
    </div>
  </section>
);

export default Contact;
