import React, { useEffect, useRef, useState } from 'react';

import { PROFILE } from '../constants';

/**
 * The bookend. It is dressed the same as the hero on purpose: the page opens
 * in black and acid and closes there, and everything in between is a detour
 * through the work.
 *
 * One thing to do here: write. The drone from the hero comes down and lands
 * on the B once the heading is on screen; GitHub and LinkedIn are a line
 * below in the footer.
 */
const Contact: React.FC = () => {
  const heading = useRef<HTMLHeadingElement>(null);
  const [drone, setDrone] = useState<'away' | 'landing' | 'down'>('away');
  useEffect(() => {
    const el = heading.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setDrone(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'down' : 'landing');
      io.disconnect();
    }, { threshold: .6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="contact" data-theme="brut" aria-labelledby="contact-heading" className="section-screen scroll-mt-20">
      <div className="bleed py-20">
        <p className="label text-accent">Gaborone, Botswana</p>

        {/* Broken by hand rather than left to wrap. At this size the line
            always runs over, and left to itself it drops the "it" onto a row
            of its own, which looks like a mistake rather than a decision. */}
        <h2 id="contact-heading" ref={heading} className="font-pilow mt-6 text-[clamp(3rem,13vw,11rem)] leading-[.85] text-ink">
          <span className="block">Let&rsquo;s</span>
          <span className="block">
            <span className="contact-b">b
              <svg className="contact-drone" data-state={drone} onAnimationEnd={(e) => { if (e.animationName === 'drone-land') setDrone('down'); }} viewBox="-34 -16 68 30" aria-hidden="true">
                <g fill="none" stroke="#f4f1e8" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M0 0L-21 -6M0 0L21 -6M0 0L-21 6M0 0L21 6" />
                  <path d="M-21 -6v-3.5M21 -6v-3.5M-21 6v-3.5M21 6v-3.5" />
                  <g className="contact-rotors">
                    <ellipse cx="-21" cy="-9.5" rx="10.5" ry="2.4" /><ellipse cx="21" cy="-9.5" rx="10.5" ry="2.4" />
                    <ellipse cx="-21" cy="2.5" rx="10.5" ry="2.4" /><ellipse cx="21" cy="2.5" rx="10.5" ry="2.4" />
                  </g>
                  <rect x="-8.5" y="-4.2" width="17" height="8.4" fill="#141619" />
                </g>
                <circle cx="4.5" cy=".5" r="1.5" fill="#ccff00" />
              </svg>
            </span>uild it
          </span>
        </h2>

        <div className="mt-14 grid gap-12 border-t-[3px] border-ink pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <p className="m-0 max-w-[48ch] text-xl leading-relaxed text-ink-soft">
            Want to talk about a project, ask about something here, or share what
            you’re making? Write to me. If you have a modeling request, send it
            over and I’ll let you know whether I can help.
          </p>

          <a href={`mailto:${PROFILE.email}`} className="contact-cta" data-det="email">
            <span className="label">Email me</span>
            <b>{PROFILE.email}</b>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
