import React, { useEffect, useState } from 'react';
const roles = ['software', 'machine learning', 'research', '3D modeling', 'web experiments', 'side quests'];
export default function RoleWheel() {
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => { if (!document.hidden) setStep(i => i + 1); }, 3400);
    return () => clearInterval(timer);
  }, [reduced]);
  return <div className="role-line">
    <p className="role-heading"><span>I do </span><span className="sr-only">{roles.join(', ')}.</span>
      <span className="role-window" aria-hidden="true" data-reduced={reduced}>
        <span className="role-cylinder" style={{ transform: 'translateZ(-.98em) rotateX('+step * 60+'deg)' }}>
          {roles.map((role, i) => <span key={role} className="role-face" style={{ transform: 'rotateX('+(-i * 60)+'deg) translateZ(.98em)' }}>{role}</span>)}
        </span>
        <span className="role-static">software &amp; research</span>
      </span>
    </p>
  </div>;
}

