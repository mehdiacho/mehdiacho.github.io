import React, { useEffect, useState } from 'react';

/**
 * The whole header: a small "M." that appears once the hero has scrolled
 * away and takes you back to it, where the index is.
 */
export default function HomeMark() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return <a href="#top" className="home-mark" data-shown={shown} aria-label="Back to the top" tabIndex={shown ? 0 : -1}>M<i>.</i></a>;
}
