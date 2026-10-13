import React, { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import RoleWheel from './RoleWheel';
export default function Hero() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  }, []);
  const pronounce = () => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Meh dee');
    utterance.lang = 'en-GB'; utterance.rate = .8;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); setMessage('Audio unavailable here. Pronounced MEH-dee.'); };
    setMessage(''); setSpeaking(true); speechSynthesis.speak(utterance);
  };
  return <section id="top" data-theme="brut">
    <div className="bleed hero-personal">
      <div className="hero-topline"><a href="#top" className="font-mark">MA.</a><p className="label text-ink-soft">A personal notebook / Gaborone, Botswana</p><a href="#contact" className="label text-accent">Say hello ↗</a></div>
      <div className="hero-composition">
        <p className="label text-accent">Software, questions, and a few side quests.</p>
        <h1 className="hero-name">Hi, I’m <span>Mehdi.</span></h1>
        <div className="name-pronunciation"><span>MEH-dee</span><button type="button" disabled={!supported || speaking} onClick={pronounce} aria-label="Hear Mehdi pronounced, synthetic voice" title="Synthetic pronunciation"><Volume2 size={17} aria-hidden="true" /><span>{speaking ? 'Playing…' : 'Hear it'}</span></button><span className="pronunciation-note">synthetic voice</span></div>
        <span className="sr-only" role="status">{message}</span>
        <RoleWheel />
        <div className="hero-bottom"><p className="hero-intro">I write software and study how machines learn. I’m doing an MSc at BIUST; outside of that, I’m usually following an idea into a project, a model, or another question.</p><a className="hero-explore" href="#hobbies">Take a look around <span aria-hidden="true">↘</span></a></div>
      </div>
      <div className="hero-footnote"><span>Some things work. Some are still experiments.</span><span>Scroll to get to know me ↓</span></div>
    </div>
  </section>;
}

