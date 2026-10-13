import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FloppyScene, Phase, ScreenRect } from '../lib/floppy-scene';
import { createPortal } from 'react-dom';
import { Gamepad2, BookOpen, Network, Cuboid, ArrowUpRight, X } from 'lucide-react';

const hobbies = [
  { id: 'modeling', info: 'Small parts for things I own, modeled in CAD. No printer at home right now, so the modeling is the fun part.', name: 'Making things fit', kicker: 'On the workbench', icon: Cuboid, color: '#b9d8fa', number: '01', title: 'A small fix. A lot of figuring out.', intro: 'A charger brace. A replacement key shell. An ice tray rack. CAD is where I go when a thing I own needs a part I can’t buy.', notes: ['It’s a hobby, and the modeling is the part I enjoy. I don’t currently own a 3D printer, so a finished model and a tested physical part are two different milestones.', 'The notebook keeps the geometry, measurements and unresolved fit questions together. You can rotate the models and inspect the drawings.'], href: '/models/', link: 'Open the model notebook', image: '/portfolio-3d/renders/charger-brace.webp' },
  { id: 'games', info: 'Cyberpunk 2077, games with friends, and a few browser games of my own still in progress.', name: 'One more round', kicker: 'Games & good company', icon: Gamepad2, color: '#d5c4f5', number: '02', title: 'Sometimes I just want to play.', intro: 'Cyberpunk 2077, gaming with friends, and occasionally wondering how I’d build the thing I’m playing.', notes: ['That curiosity has spilled over into browser game projects, including Machine Strike and Highrise. They’re still works in progress.', 'There’s also a weekly arcade right here. This week you play an object detector, and the top score each week goes in the hall of fame.'], href: '#play', link: 'Play this week’s game' },
  { id: 'reading', info: 'Manhwa, mostly. Not everything needs to be a project. Sometimes a story is enough.', name: 'Between chapters', kicker: 'Off the clock', icon: BookOpen, color: '#f9bc83', number: '03', title: 'Another chapter before I stop.', intro: 'Reading manhwa is one of the things I come back to when I’m away from work.', notes: ['Not everything needs to become a project. Sometimes a good story is enough.', 'This corner will grow into a more personal reading shelf as I add the titles and stories I want to share.'] },
  { id: 'homelab', info: 'A NAS, a router and a computer that work together. I’m modeling the desk as Desk Twin.', name: 'My little network', kicker: 'At home, online', icon: Network, color: '#bedbbc', number: '04', title: 'A desk with a life of its own.', intro: 'A NAS, a router, a computer, and the small systems that make them useful together.', notes: ['I’m also modeling the setup as Desk Twin: a browser space based on the real objects around me.', 'Eventually those objects will be ways into the site: a monitor for projects, a NAS for browsing, and a controller for games. For now, you can explore the desk model.'], href: 'https://v2.mehdiacho.tech', link: 'Explore Desk Twin' },
];
type Hobby = typeof hobbies[number];
type Selection = { hobby: Hobby; rect: DOMRect; trigger: HTMLButtonElement };

/** A 3.5" floppy: shutter at the top, label below. The same face is drawn in 3D. */
function CardFace({ hobby }: { hobby: Hobby }) {
  const Icon = hobby.icon;
  return <><span className="floppy-shutter" aria-hidden="true"><span /></span><span className="floppy-tab" aria-hidden="true" /><div className="floppy-label"><div className="quest-card-top"><span>{hobby.kicker}</span><span>{hobby.number}</span></div><Icon className="floppy-icon" size={34} strokeWidth={1.3} aria-hidden="true" /><div className="quest-card-bottom"><h3>{hobby.name}</h3><ArrowUpRight size={22} aria-hidden="true" /></div></div></>;
}

function HobbyScreen({ selection, onClose, closeRequest }: { selection: Selection; onClose: (jumpTo?: string) => void; closeRequest: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const flip = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const animations = useRef<Animation[]>([]);
  const closing = useRef(false);
  const [ready, setReady] = useState(false);
  const { hobby, rect } = selection;
  useEffect(() => {
    const el = dialog.current!;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; el.showModal();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const w = innerWidth, h = innerHeight;
    const liftedWidth = Math.min(440, w - 32), liftedHeight = Math.min(520, h - 32);
    animations.current = [
      shell.current!.animate([
        { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: '18px', offset: 0 },
        { left: `${(w-liftedWidth)/2}px`, top: `${(h-liftedHeight)/2-10}px`, width: `${liftedWidth}px`, height: `${liftedHeight}px`, borderRadius: '18px', offset: .48 },
        { left: '0px', top: '0px', width: `${w}px`, height: `${h}px`, borderRadius: '0px', offset: 1 },
      ], { duration: reduced ? 0 : 1150, easing: 'cubic-bezier(.22,.75,.2,1)', fill: 'forwards' }),
      flip.current!.animate([{ transform: 'rotateY(0deg)', offset: 0 }, { transform: 'rotateY(-12deg)', offset: .18 }, { transform: 'rotateY(180deg)', offset: .72 }, { transform: 'rotateY(180deg)', offset: 1 }], { duration: reduced ? 0 : 1150, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }),
    ];
    let disposed = false;
    Promise.all(animations.current.map(a => a.finished)).then(() => {
      if (disposed || closing.current) return;
      setReady(true); closeButton.current?.focus({ preventScroll: true });
    }).catch(() => {});
    return () => { disposed = true; animations.current.forEach(a => a.cancel()); el.close(); document.body.style.overflow = oldOverflow; selection.trigger.focus({ preventScroll: true }); };
  }, [selection]);
  useEffect(() => { if (ready) closeButton.current?.focus({ preventScroll: true }); }, [ready]);
  // The browser's back button asks for the same exit as the close button.
  const firstRequest = useRef(closeRequest);
  useEffect(() => { if (closeRequest !== firstRequest.current) void close(); }, [closeRequest]);
  const close = async () => {
    if (closing.current) return;
    closing.current = true; setReady(false);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animations.current.forEach(a => { a.playbackRate = -1.6; a.play(); });
      await Promise.all(animations.current.map(a => a.finished.catch(() => {})));
    }
    onClose();
  };
  return createPortal(<dialog ref={dialog} className="quest-dialog" aria-labelledby="quest-screen-heading" onCancel={event => { event.preventDefault(); void close(); }}>
    <div ref={shell} className="quest-flight" data-ready={ready} style={{ '--quest-color': hobby.color } as React.CSSProperties}>
      <div ref={flip} className="quest-flipper">
        <div className="quest-front" aria-hidden="true"><CardFace hobby={hobby} /></div>
        <div className="quest-back">
          <div className="quest-screen" inert={!ready}>
            <div className="quest-screen-bar"><span>Side quests / {hobby.number}</span><button ref={closeButton} onClick={close} aria-label="Back to the discs"><X size={18} /> Back to the discs</button></div>
            <div className="quest-screen-content"><p className="label">{hobby.kicker}</p><h2 id="quest-screen-heading">{hobby.title}</h2><p className="quest-screen-lead">{hobby.intro}</p>
              {hobby.image && <img src={hobby.image} width="900" height="674" alt="The modeled charger brace" />}
              <div className="quest-notes">{hobby.notes.map(note => <p key={note}>{note}</p>)}</div>
              {hobby.href && <a className="quest-destination" href={hobby.href} onClick={hobby.href.startsWith('#') ? event => { event.preventDefault(); onClose(hobby.href); requestAnimationFrame(() => document.querySelector(hobby.href!)?.scrollIntoView({ behavior: 'instant' })); } : undefined}>{hobby.link} ↗</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
    {!ready && <button className="quest-cancel" onClick={close} aria-label="Close hobby screen">×</button>}
  </dialog>, document.body);
}

const HASH = '#side-quests/';
const fromHash = () => {
  const id = location.hash.startsWith(HASH) ? location.hash.slice(HASH.length) : '';
  return hobbies.find(h => h.id === id);
};

/**
 * The flat deck: what phones, reduced-motion visitors and the prerendered page
 * get, and what shows while the 3D room loads.
 *
 * Each open card gets its own address (#side-quests/<id>), so a hobby can be
 * linked to, and the back button closes the card instead of leaving the site.
 * While the 3D room is on its way, it owns the address instead (`routing`).
 */
function FlatDeck({ routing }: { routing: boolean }) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [closeRequest, setCloseRequest] = useState(0);
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  // Whether opening the card added a history entry that closing should undo.
  const pushed = useRef(false);

  const open = (hobby: Hobby, trigger: HTMLButtonElement, push = true) => {
    if (push && routing) { history.pushState({ sideQuest: hobby.id }, '', HASH + hobby.id); pushed.current = true; }
    setSelection({ hobby, rect: trigger.getBoundingClientRect(), trigger });
  };

  useEffect(() => {
    if (!routing) return;
    const linked = fromHash();
    const trigger = linked && cards.current[linked.id];
    if (linked && trigger) { trigger.scrollIntoView({ block: 'center' }); open(linked, trigger, false); }
    const onPop = () => {
      const hobby = fromHash();
      const card = hobby && cards.current[hobby.id];
      pushed.current = false;
      if (hobby && card) open(hobby, card, false);
      else setCloseRequest(n => n + 1);
    };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [routing]);

  const closed = (jumpTo?: string) => {
    setSelection(null);
    if (jumpTo) history.replaceState(null, '', jumpTo);
    else if (pushed.current) history.back();
    else if (location.hash.startsWith(HASH)) history.replaceState(null, '', location.pathname + location.search);
    pushed.current = false;
  };

  return <><div className="quest-deck">{hobbies.map((hobby, i) => <button key={hobby.id} ref={el => { cards.current[hobby.id] = el; }} className="quest-card" style={{ '--quest-color': hobby.color, '--card-index': i, '--card-angle': `${(i - 1.5) * 7}deg` } as React.CSSProperties} onClick={event => open(hobby, event.currentTarget)} aria-label={`Open ${hobby.name}`} aria-haspopup="dialog"><CardFace hobby={hobby} /></button>)}</div><p className="quest-caption">Pick a disc. There’s a little more on the other side.</p>{selection && <React.Fragment key={selection.hobby.id}><HobbyScreen selection={selection} onClose={closed} closeRequest={closeRequest} /></React.Fragment>}</>;
}

const discs = hobbies.map(({ id, name, number, kicker, color, info }) => ({ id, name, number, kicker, color, info }));

/**
 * The 3D room: the discs float over a desk in front of an old PC. Pick one up
 * to read its back, insert it, and its page comes up on the monitor. The page
 * itself is plain HTML laid over the monitor glass, so it stays readable,
 * selectable and reachable by keyboard.
 */
function FloppyRoom({ onReady, onFail }: { onReady(): void; onFail(): void }) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<FloppyScene | null>(null);
  const [phase, setPhase] = useState<Phase>('deck');
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [rect, setRect] = useState<ScreenRect | null>(null);
  const [ready, setReady] = useState(false);
  const pushed = useRef(false), instant = useRef(false), lastActive = useRef<string | null>(null);
  const insertButton = useRef<HTMLButtonElement>(null), ejectButton = useRef<HTMLButtonElement>(null);
  const indexButtons = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    let disposed = false, started = false;
    const start = async () => {
      if (started) return;
      started = true; observer.disconnect();
      try {
        const { createFloppyScene } = await import('../lib/floppy-scene');
        if (disposed) return;
        const s = await createFloppyScene(host.current!, discs, {
          onHover: setHover,
          onPhase: (next, id) => { setPhase(next); setActive(id); if (id) lastActive.current = id; },
          onError: onFail,
        });
        if (disposed) { s.dispose(); return; }
        scene.current = s; setReady(true); onReady();
        const linked = fromHash();
        if (linked) { instant.current = true; s.openInstant(linked.id); }
      } catch { if (!disposed) onFail(); }
    };
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) void start(); }, { rootMargin: '600px' });
    if (fromHash()) { host.current!.scrollIntoView({ block: 'center' }); void start(); }
    else observer.observe(host.current!);
    const onPop = () => {
      const s = scene.current, linked = fromHash();
      if (!s) return;
      pushed.current = false;
      if (!linked && s.phase === 'screen') s.eject();
      else if (linked && s.phase === 'deck') { instant.current = true; s.openInstant(linked.id); }
    };
    addEventListener('popstate', onPop);
    return () => { disposed = true; observer.disconnect(); removeEventListener('popstate', onPop); scene.current?.dispose(); scene.current = null; };
  }, []);

  // The monitor page follows the glass when the stage resizes.
  useEffect(() => {
    if (phase !== 'screen') { setRect(null); return; }
    const measure = () => requestAnimationFrame(() => scene.current && setRect(scene.current.screenRect()));
    measure();
    if (!instant.current && active && !pushed.current) { history.pushState({ sideQuest: active }, '', HASH + active); pushed.current = true; }
    instant.current = false;
    const observer = new ResizeObserver(measure); observer.observe(host.current!);
    return () => observer.disconnect();
  }, [phase]);

  useEffect(() => {
    if (phase === 'inspect') insertButton.current?.focus({ preventScroll: true });
    if (phase === 'screen' && rect) ejectButton.current?.focus({ preventScroll: true });
    if (phase === 'deck' && lastActive.current && host.current?.contains(document.activeElement) === false && document.activeElement === document.body) indexButtons.current[lastActive.current]?.focus({ preventScroll: true });
  }, [phase, rect]);

  const eject = useCallback((jumpTo?: string) => {
    const s = scene.current;
    if (!s) return;
    if (jumpTo) { pushed.current = false; history.replaceState(null, '', jumpTo); s.eject(); requestAnimationFrame(() => document.querySelector(jumpTo)?.scrollIntoView({ behavior: 'instant' })); return; }
    if (pushed.current) { history.back(); return; }
    if (location.hash.startsWith(HASH)) history.replaceState(null, '', location.pathname + location.search);
    s.eject();
  }, []);

  useEffect(() => {
    if (phase !== 'inspect' && phase !== 'screen') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (phase === 'inspect') scene.current?.putBack(); else eject();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [phase, eject]);

  const hobby = hobbies.find(h => h.id === active);
  return <div className="floppy-room" data-ready={ready} data-phase={phase}>
    <div ref={host} className="floppy-canvas" />
    {ready && <>
      <p className="floppy-hint label" aria-hidden="true">{phase === 'inspect' ? 'Insert it into the PC to load it' : phase === 'deck' ? 'Pick a disc to take a closer look' : ''}</p>
      {phase === 'deck' && <ol className="floppy-index" aria-label="Side quest discs">{hobbies.map(h => <li key={h.id}>
        <button ref={el => { indexButtons.current[h.id] = el; }} data-hot={hover === h.id} style={{ '--quest-color': h.color } as React.CSSProperties}
          onClick={() => scene.current?.select(h.id)} onMouseEnter={() => scene.current?.hover(h.id)} onMouseLeave={() => scene.current?.hover(null)}
          onFocus={() => scene.current?.hover(h.id)} onBlur={() => scene.current?.hover(null)} aria-label={`Pick up disc ${h.number}: ${h.name}`}>
          <span aria-hidden="true">{h.number}</span> {h.name}
        </button></li>)}</ol>}
      {phase === 'inspect' && hobby && <div className="floppy-controls" role="group" aria-label={`Disc ${hobby.number}: ${hobby.name}`}>
        <p className="sr-only" aria-live="polite">{hobby.name}. {hobby.info}</p>
        <button ref={insertButton} className="btn" onClick={() => scene.current?.insert()}>Insert disc</button>
        <button className="btn-hollow" onClick={() => scene.current?.putBack()}>Put it back</button>
      </div>}
      {phase === 'screen' && hobby && rect && <div className="floppy-monitor" data-theme="brut" role="region" aria-labelledby="floppy-monitor-heading"
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
        <div className="floppy-monitor-bar"><span>A:\QUEST{hobby.number}.EXE</span><button ref={ejectButton} onClick={() => eject()} aria-label="Eject the disc and go back to the desk">Eject ⏏</button></div>
        <div className="floppy-monitor-body">
          <p className="label text-accent">{hobby.kicker}</p>
          <h3 id="floppy-monitor-heading">{hobby.title}</h3>
          <p className="floppy-monitor-lead">{hobby.intro}</p>
          {hobby.image && <img src={hobby.image} width="900" height="674" alt="The modeled charger brace" />}
          {hobby.notes.map(note => <p key={note}>{note}</p>)}
          {hobby.href && <a className="floppy-monitor-link" href={hobby.href} onClick={hobby.href.startsWith('#') ? event => { event.preventDefault(); eject(hobby.href); } : undefined}>{hobby.link} ↗</a>}
        </div>
      </div>}
    </>}
  </div>;
}

/**
 * Side quests. Big screens with motion allowed get the 3D room; everyone else,
 * and the prerendered page, gets the flat deck. A failed 3D start falls back.
 */
export default function Hobbies() {
  const [mode, setMode] = useState<'flat' | 'loading' | 'room'>('flat');
  useEffect(() => {
    if (matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)').matches) setMode('loading');
  }, []);
  const ready = useCallback(() => setMode('room'), []);
  const failed = useCallback(() => setMode('flat'), []);
  return <div className="floppy-stage" data-mode={mode}>
    {mode !== 'room' && <FlatDeck routing={mode === 'flat'} />}
    {mode !== 'flat' && <FloppyRoom onReady={ready} onFail={failed} />}
  </div>;
}
