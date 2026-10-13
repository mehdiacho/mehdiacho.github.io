import React, { useEffect, useState } from 'react';
const links = [
  ['top', 'Hello'], ['hobbies', 'Side quests'], ['software', 'Software'],
  ['research', 'Research'], ['cad', 'Models'], ['visualisation', 'My desk'],
  ['about', 'Background'], ['play', 'Play'], ['contact', 'Say hello'],
];
export default function SiteHeader() {
  const [active, setActive] = useState('top');
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const nodes = links.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = [...nodes].reverse().find(node => node.getBoundingClientRect().top <= innerHeight * .35);
        setActive(current?.id || 'top');
      });
    };
    update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, []);
  return <header className="checkpoint-header" data-expanded={expanded}>
    <button className="checkpoint-toggle" aria-expanded={expanded} aria-controls="section-checkpoints" onClick={() => setExpanded(value => !value)} aria-label="Toggle section navigation">☰</button>
    <nav id="section-checkpoints" aria-label="Page checkpoints">
      {links.map(([id, label], i) => <a key={id} href={'#'+id} aria-label={label} aria-current={active === id ? 'location' : undefined} onClick={() => setExpanded(false)}>
        <span className="checkpoint-label">{label}</span><span className="checkpoint-mark" aria-hidden="true">{String(i).padStart(2, '0')}</span>
      </a>)}
    </nav>
  </header>;
}

