import React, { useEffect, useState, lazy, Suspense } from 'react';

import SiteHeader from './components/SiteHeader';
import Hero from './components/Hero';
import Section from './components/Section';
import Services from './components/Services';
import Work3D from './components/Work3D';
import Visualisation from './components/Visualisation';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import SiteFooter from './components/SiteFooter';

const Vault = lazy(() => import('./components/Vault'));
import { normalizeCode } from './lib/vault-crypto';
import { ABOUT } from './constants';

const App: React.FC = () => {
  // SECURE_VAULT modal. Opens from the project card or from a #vault=<token>
  // share link; everything else on the page is a plain document.
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultTab, setVaultTab] = useState<'send' | 'receive'>('send');
  const [vaultToken, setVaultToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Deep link: someone opened a share link — jump straight into RECEIVE.
    const hash = window.location.hash;
    if (hash.startsWith('#vault=')) {
      setVaultToken(normalizeCode(hash));
      setVaultTab('receive');
      setVaultOpen(true);
      // Strip the secret from the URL so it isn't left lying in the address bar.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Any component can request the vault via a window event (no prop drilling).
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: 'send' | 'receive' }>).detail;
      setVaultToken(undefined);
      setVaultTab(detail?.tab ?? 'send');
      setVaultOpen(true);
    };
    window.addEventListener('vault:open', onOpen as EventListener);
    return () => window.removeEventListener('vault:open', onOpen as EventListener);
  }, []);

  return (
    <div className="min-h-screen">
      <a
        href="#services"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-ink focus:bg-paper focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main>
        <Hero />

        <Section
          id="services"
          number="01"
          title={<>What I&rsquo;m hired to do</>}
          standfirst="Three things, in the order I want to be hired for them. Each one has a page of its own with more detail."
        >
          <Services />
        </Section>

        <Section
          id="cad"
          number="02"
          title={<>3D printing and CAD modeling in Botswana</>}
          standfirst="Parts for things that broke, or that were never made in the first place. Measured first, drawn second, printed last."
        >
          <Work3D />
        </Section>

        <Section
          id="visualisation"
          number="03"
          title={<>3D visualisation</>}
          standfirst="Scenes built from real measurements, so what you see on screen is what you would get in the room."
        >
          <Visualisation />
        </Section>

        <Section
          id="software"
          number="04"
          title={<>Software and web work</>}
          standfirst="Apps, tools and sites I have built. Some are live, some are still being made, and the list says which is which."
        >
          <Projects />
        </Section>

        <Section
          id="about"
          number="05"
          title={<>About</>}
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="space-y-5">
              {ABOUT.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-base leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>

            <div>
              <h3 className="label text-ink-faint">What I work with</h3>
              <div className="mt-4">
                <Skills />
              </div>
            </div>
          </div>

          <div className="mt-14">
            <h3 className="label text-ink-faint">Where I&rsquo;ve been</h3>
            <div className="mt-4">
              <Timeline />
            </div>
          </div>
        </Section>

        <Contact />
      </main>

      <SiteFooter />

      {/* SECURE_VAULT — zero-knowledge secret sharing */}
      {vaultOpen && (
        <Suspense fallback={<p role="status">Loading…</p>}>
          <Vault
            open={vaultOpen}
            initialTab={vaultTab}
            initialToken={vaultToken}
            onClose={() => setVaultOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
