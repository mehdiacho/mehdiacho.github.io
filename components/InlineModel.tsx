import React, { useEffect, useRef, useState } from 'react';
import type { createCadViewer } from '../lib/cad-viewer';
type Viewer = Awaited<ReturnType<typeof createCadViewer>>;

export default function InlineModel({ src, poster, alt, priority = false }: { src: string; poster?: string; alt: string; priority?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoaded(false); setFailed(false);
    const fail = () => {
      if (controller.signal.aborted) return;
      viewer.current?.dispose(); viewer.current = null; setFailed(true); setLoaded(false);
    };
    const start = async () => {
      observer?.disconnect();
      try {
        const { createCadViewer } = await import('../lib/cad-viewer');
        if (controller.signal.aborted) return;
        const instance = await createCadViewer(host.current!, src, alt, controller.signal, fail);
        if (controller.signal.aborted) { instance.dispose(); return; }
        viewer.current = instance; setLoaded(true);
      } catch { fail(); }
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) void start();
    }, { rootMargin: '100px' });
    if (observer) observer.observe(host.current!); else void start();
    return () => { controller.abort(); observer?.disconnect(); viewer.current?.dispose(); viewer.current = null; };
  }, [src, alt, attempt]);
  return <div className="inline-model">
    <div className="model-stage">
      {!loaded && poster && <img src={poster} alt={alt} width="900" height="675" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />}
      <div ref={host} className="model-canvas" />
    </div>
    <div className="model-tools">
      <span>{failed ? `The 3D view could not load.${poster ? ' The still is shown.' : ''}` : loaded ? 'Drag / arrow keys to rotate · right-drag / two fingers to pan' : `3D view loads when in view.${poster ? ' A still is shown while it loads.' : ''}`}</span>
      <div className="model-buttons">{failed ? <button onClick={() => setAttempt(a => a + 1)}>Retry 3D view</button> : <>
        <button aria-label="Zoom out" disabled={!loaded} onClick={() => viewer.current?.zoom(1.15)}>−</button>
        <button aria-label="Zoom in" disabled={!loaded} onClick={() => viewer.current?.zoom(1 / 1.15)}>+</button>
        <button onClick={() => viewer.current?.reset()} disabled={!loaded}>Reset view</button>
      </>}</div>
    </div>
  </div>;
}
