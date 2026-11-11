import React, { useEffect, useState } from 'react';

/**
 * The whole header: a small "M." that appears once the hero has scrolled
 * away and takes you back to it, where the index is.
 */
export default function HomeMark() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    // The hero is pinned while the first sheet covers it, so it never leaves
    // the viewport on its own; go by how far the page has moved instead.
    const check = () => setShown(scrollY > innerHeight * .7);
    check();
    addEventListener('scroll', check, { passive: true });
    return () => removeEventListener('scroll', check);
  }, []);
  return <a href="#top" className="home-mark" data-shown={shown} aria-label="Back to the top" tabIndex={shown ? 0 : -1}>M<i>.</i></a>;
}
