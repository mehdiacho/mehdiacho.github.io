import React, { useEffect, useState } from 'react';

const roles = ['CAD modeling', '3D printing', 'web development'];

export default function RoleWheel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (paused || reduced) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex(i => (i + 1) % roles.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [paused, reduced]);
  return <div className="role-line">
    <p className="role-heading"><span>I do </span><span className="sr-only">CAD modeling, 3D printing and web development.</span>
      <span className="role-window" aria-hidden="true">
        {roles.map((role, i) => <span key={role} className={i === index ? 'role-word active' : 'role-word'}>{role}</span>)}
      </span>
    </p>
    {!reduced && <button className="role-pause" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Resume changing interests' : 'Pause changing interests'}>{paused ? 'Play ↻' : 'Pause Ⅱ'}</button>}
  </div>;
}
