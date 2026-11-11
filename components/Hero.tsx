import React, { useEffect, useRef, useState } from 'react';
import { PROFILE } from '../constants';
import { ROOMS } from './Rooms';

/**
 * The first screen: the name on the left, the whole site as a list on the
 * right. There is no header; this list is the navigation.
 *
 * The drone that patrols the name is drawn by lib/hero-drone.ts on two
 * canvases it adds itself. It is loaded after first paint and the page is
 * complete without it, so removing it is deleting the import below.
 */
export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  }, []);
  useEffect(() => {
    let stop: (() => void) | undefined, gone = false;
    import('../lib/hero-drone').then(m => { if (!gone && hero.current) stop = m.mountDrone(hero.current); });
    return () => { gone = true; stop?.(); };
  }, []);
  const pronounce = () => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Meh dee');
    utterance.lang = 'en-GB'; utterance.rate = .8;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); setMessage('Audio unavailable here. Pronounced MEH-dee.'); };
    setMessage(''); setSpeaking(true); speechSynthesis.speak(utterance);
  };
  return <section data-theme="brut" className="hero" ref={hero}>
    <div className="bleed hero-grid">
      <div className="hero-who">
        <h1 className="hero-name"><small className="hero-hi">Hi, I’m </small><span>Mehdi.</span></h1>
        <div className="name-pronunciation" data-speaking={speaking}>
          <span>MEH-dee</span>
          <button type="button" disabled={!supported || speaking} onClick={pronounce} aria-label="Hear Mehdi pronounced, synthetic voice" title="Synthetic pronunciation">
            <span className="hero-wave" aria-hidden="true"><i /><i /><i /><i /></span><span>{speaking ? 'Playing…' : 'Hear it'}</span>
          </button>
          <span className="pronunciation-note">synthetic voice</span>
        </div>
        <span className="sr-only" role="status">{message}</span>
        <p className="hero-intro">I write software and study how machines learn. I’m doing an MSc at BIUST; outside of that, I’m usually following an idea into a project, a model, or another question.</p>
      </div>
      <nav className="hero-index" aria-label="Site">
        {ROOMS.map((room, i) => <a key={room.key} href={room.href} data-det={room.title.toLowerCase()} style={{ '--i': i } as React.CSSProperties} {...(room.external ? { target: '_blank', rel: 'noopener' } : {})}>
          <b>{room.title}</b><span>{room.line}</span>
        </a>)}
        <a href="#contact" data-det="contact" style={{ '--i': ROOMS.length } as React.CSSProperties}><b>Contact</b><span>{PROFILE.email}</span></a>
      </nav>
    </div>
  </section>;
}
