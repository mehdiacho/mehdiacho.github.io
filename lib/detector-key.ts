import { useEffect } from 'react';

/**
 * Press D anywhere and the page shows what an object detector would make of
 * it. The drawing code (lib/detector.ts) is only fetched on the first press.
 */
export function useDetectorKey() {
  useEffect(() => {
    let toggle: (() => void) | undefined, loading = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'd' || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (toggle) return toggle();
      if (loading) return;
      loading = true;
      import('./detector').then((m) => { toggle = m.toggleDetector; toggle(); });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
}
