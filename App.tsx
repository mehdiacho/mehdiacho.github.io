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

/**
 * The page.
 *
 * Each section names its own theme and its own heading layout, and no two
 * next to each other share either — the ground changes under you as you go
 * down, which is the point. What the theme actually does to the colours is
 * in index.css §2.
 */
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-[3px] focus:border-ink focus:bg-paper focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main>
        <Hero />

        <Section
          id="services"
          number="01"
          theme="riso"
          variant="banner"
          title={<>What I&rsquo;m hired to do</>}
          standfirst="Three things. Roughly in the order I'd like to be hired for them."
        >
          <Services />
        </Section>

        <Section
          id="cad"
          number="02"
          theme="blueprint"
          variant="rail"
          title={<>3D printing and CAD modeling in Botswana</>}
          standfirst="Mostly replacements for parts nobody sells any more. Nothing gets modelled until it has been measured."
        >
          <Work3D />
        </Section>

        <Section
          id="visualisation"
          number="03"
          theme="soft"
          variant="inline"
          title={<>3D visualisation</>}
          standfirst="Rooms and layouts built from real measurements. Much cheaper to be wrong on a screen than in the room."
        >
          <Visualisation />
        </Section>

        <Section
          id="software"
          number="04"
          theme="swiss"
          variant="banner"
          title={<>Software and web work</>}
          standfirst="Everything I have built. Some of it is live, plenty of it is not finished, and the labels say which is which."
        >
          <Projects />
        </Section>

        {/* The "about me" itself is in the hero, where he asked for it. This
            is the rest of the file: what he reaches for, and where he has been. */}
        <Section
          id="about"
          number="05"
          theme="ledger"
          variant="rail"
          title={<>Background</>}
          standfirst="What I reach for, and where I have been so far."
        >
          <h3 className="label text-accent">What I work with</h3>
          <div className="mt-5">
            <Skills />
          </div>

          <h3 className="label mt-16 text-accent">Where I&rsquo;ve been</h3>
          <div className="mt-5">
            <Timeline />
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
