import React, { useEffect, useState, lazy, Suspense } from 'react';

import CadPages from './components/CadPages';
import { CAD_PAGES } from './lib/prints';
import PrivacyPreferences from './components/PrivacyPreferences';
import HomeMark from './components/HomeMark';
import Hero from './components/Hero';
import Section from './components/Section';
import Hobbies from './components/Hobbies';
import Research from './components/Research';
import RoomPage from './components/RoomPage';
import { eegField } from './components/Rooms';
import Background from './components/Background';
import Projects from './components/Projects';
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
const Home: React.FC = () => {
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
        href="#software"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-[3px] focus:border-ink focus:bg-paper focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <HomeMark />

      <main>
        <Hero />

        <Section id="software" number="01" theme="swiss" variant="banner" title={<>Built from an idea.</>} standfirst="Software I’m making, from useful little tools to experiments that grew legs. Live projects and works in progress, with room for what comes next.">
          <Projects />
        </Section>
        <Section id="about" number="02" theme="ledger" variant="rail" title={<>A bit of background.</>} standfirst="How I got here, what I care about, and what I’m learning along the way.">
          <Background />
        </Section>
        <Section id="hobbies" number="03" theme="riso" variant="banner" title={<>Side quests</>} standfirst="The things I get into when I follow my curiosity. Pick a disc and come a little closer.">
          <Hobbies />
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

/** The research room: everything that used to be section 02 of the home page. */
const ResearchRoom: React.FC = () => (
  <RoomPage name="Research" theme="brut" label="MSc / BIUST" title="Research" intro="My MSc, in one question." texture={eegField()}>
    <Research />
  </RoomPage>
);

export default function App({ path = typeof window === 'undefined' ? '/' : window.location.pathname }: { path?: string }) {
  const normalized = path.endsWith('/') ? path : path + '/';
  const modelPage = normalized === '/models/' || CAD_PAGES.some(p => p.path === normalized);
  const page = normalized === '/research/' ? <ResearchRoom /> : modelPage ? <CadPages path={normalized} /> : <Home />;
  return <>{page}<PrivacyPreferences /></>;
}
