import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES: string[] = [
  '[ BIOS ] Terminal-U v2.0 .................. OK',
  '[  OK  ] Mounting /dev/mehdi',
  '[  OK  ] Loading neural cores ......... 8/8',
  '[  OK  ] Calibrating PyTorch tensors',
  '[  OK  ] Establishing uplink :: GABORONE, BW',
  '[ WARN ] Caffeine reserves ............ LOW',
  '[  OK  ] Spawning human interface',
  '',
  'WELCOME, OPERATOR.',
];

const SEEN_KEY = 'tu_boot_dismissed';
const LINE_DELAY = 170; // ms per line

interface BootSequenceProps {
  onComplete: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);
  const dontShowRef = useRef(false); // latest value, readable from stale-closure timers

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (dontShowRef.current) {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    }
    setExiting(true);
    // Let the fade-out play before unmounting.
    setTimeout(onComplete, 350);
  };

  // Reveal lines one at a time (or all at once when reduced motion).
  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisibleCount(BOOT_LINES.length);
      const t = setTimeout(finish, 400);
      return () => clearTimeout(t);
    }
    const interval = setInterval(() => {
      setVisibleCount(c => {
        if (c >= BOOT_LINES.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, LINE_DELAY);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-finish shortly after the last line renders.
  useEffect(() => {
    if (visibleCount >= BOOT_LINES.length) {
      const t = setTimeout(finish, 650);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount]);

  // Skip on any key press.
  useEffect(() => {
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-mono crt-scanlines crt-flicker cursor-pointer"
          onClick={finish}
          role="button"
          aria-label="Skip intro"
        >
          <div className="relative z-10 w-full max-w-2xl px-6">
            <div className="text-green-500 text-sm sm:text-base leading-relaxed">
              {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line.includes('WARN') ? <span className="text-amber-400">{line}</span>
                    : line.startsWith('WELCOME') ? <span className="text-cyan-400 font-bold">{line}</span>
                    : line}
                </div>
              ))}
              {visibleCount < BOOT_LINES.length && (
                <span className="inline-block w-2.5 h-4 bg-green-500 align-middle cursor-blink" />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute z-10 bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-zinc-500">
            <label
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest cursor-pointer select-none hover:text-zinc-300"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => { setDontShow(e.target.checked); dontShowRef.current = e.target.checked; }}
                className="accent-cyan-500"
              />
              Don&apos;t show again
            </label>
            <span className="text-[10px] uppercase tracking-widest text-zinc-600">
              click anywhere / press any key to skip
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootSequence;
