import React, { useEffect, useState, lazy, Suspense } from 'react';

import CadPages from './components/CadPages';
import { CAD_PAGES } from './lib/prints';
import PrivacyPreferences from './components/PrivacyPreferences';
import SiteHeader from './components/SiteHeader';
import Hero from './components/Hero';
import Section from './components/Section';
import Hobbies from './components/Hobbies';
import Research from './components/Research';
import Background from './components/Background';
import SignalGame from './components/SignalGame';
import Work3D from './components/Work3D';
import Visualisation from './components/Visualisation';
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
        href="#hobbies"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-[3px] focus:border-ink focus:bg-paper focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main>
        <Hero />

        <Section id="hobbies" number="01" theme="riso" variant="banner" title={<>Side quests</>} standfirst="The things I get into when I follow my curiosity. Pick a card and come a little closer.">
          <Hobbies />
        </Section>
        <Section id="software" number="02" theme="swiss" variant="banner" title={<>Built from an idea.</>} standfirst="Software I’m making, from useful little tools to experiments that grew legs. Live projects and works in progress, with room for what comes next.">
          <Projects />
        </Section>
        <Section id="research" number="03" theme="brut" variant="inline" title={<>Questions worth testing.</>} standfirst="Machine learning, graph networks, and the work behind the result.">
          <Research />
        </Section>
        <Section id="cad" number="04" theme="blueprint" variant="rail" title={<>Models, on the side.</>} standfirst="A hobby with calipers. Small fixes, the drawings behind them and the questions that are still open.">
          <Work3D />
        </Section>
        <Section id="visualisation" number="05" theme="soft" variant="inline" title={<>A room of my own.</>} standfirst="Turning my desk into a little place you can explore in a browser. Still taking shape.">
          <Visualisation />
        </Section>
        <Section id="about" number="06" theme="ledger" variant="rail" title={<>A bit of background.</>} standfirst="How I got here, what I care about, and what I’m learning along the way.">
          <Background />
        </Section>
        <Section id="play" number="07" theme="brut" variant="inline" title={<>Take the scenic route.</>} standfirst="Or the shortest one. A small puzzle for the part of your brain that keeps looking for a better path.">
          <SignalGame />
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

export default function App({ path = typeof window === 'undefined' ? '/' : window.location.pathname }: { path?: string }) {
  const normalized = path.endsWith('/') ? path : path + '/';
  const modelPage = normalized === '/models/' || CAD_PAGES.some(p => p.path === normalized);
  return <>{modelPage ? <CadPages path={normalized} /> : <Home />}<PrivacyPreferences /></>;
}
