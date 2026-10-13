import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Gamepad2, BookOpen, Network, Cuboid, ArrowUpRight, X } from 'lucide-react';

const hobbies = [
  { id: 'modeling', name: 'Making things fit', kicker: 'On the workbench', icon: Cuboid, color: '#b9d8fa', number: '01', title: 'A small fix. A lot of figuring out.', intro: 'A charger brace. A replacement key shell. An ice tray rack. CAD is where I go when a thing I own needs a part I can’t buy.', notes: ['It’s a hobby, and the modeling is the part I enjoy. I don’t currently own a 3D printer, so a finished model and a tested physical part are two different milestones.', 'The notebook keeps the geometry, measurements and unresolved fit questions together. You can rotate the models and inspect the drawings.'], href: '/models/', link: 'Open the model notebook', image: '/portfolio-3d/renders/charger-brace.webp' },
  { id: 'games', name: 'One more round', kicker: 'Games & good company', icon: Gamepad2, color: '#d5c4f5', number: '02', title: 'Sometimes I just want to play.', intro: 'Cyberpunk 2077, gaming with friends, and occasionally wondering how I’d build the thing I’m playing.', notes: ['That curiosity has spilled over into browser game projects, including Machine Strike and Highrise. They’re still works in progress.', 'There’s also a small graph-routing challenge right here. Find your way through the network and try to beat your own score.'], href: '#play', link: 'Play Signal Run' },
  { id: 'reading', name: 'Between chapters', kicker: 'Off the clock', icon: BookOpen, color: '#f9bc83', number: '03', title: 'Another chapter before I stop.', intro: 'Reading manhwa is one of the things I come back to when I’m away from work.', notes: ['Not everything needs to become a project. Sometimes a good story is enough.', 'This corner will grow into a more personal reading shelf as I add the titles and stories I want to share.'] },
  { id: 'homelab', name: 'My little network', kicker: 'At home, online', icon: Network, color: '#bedbbc', number: '04', title: 'A desk with a life of its own.', intro: 'A NAS, a router, a computer, and the small systems that make them useful together.', notes: ['I’m also modeling the setup as Desk Twin: a browser space based on the real objects around me.', 'Eventually those objects will be ways into the site: a monitor for projects, a NAS for browsing, and a controller for games. For now, you can explore the desk model.'], href: 'https://v2.mehdiacho.tech', link: 'Explore Desk Twin' },
];
type Hobby = typeof hobbies[number];
type Selection = { hobby: Hobby; rect: DOMRect; trigger: HTMLButtonElement };

function CardFace({ hobby }: { hobby: Hobby }) {
  const Icon = hobby.icon;
  return <><div className="quest-card-top"><span>{hobby.kicker}</span><span>{hobby.number}</span></div><div className={`quest-illustration quest-${hobby.id}`}><Icon size={108} strokeWidth={.8} /><span className="quest-orbit" /></div><div className="quest-card-bottom"><h3>{hobby.name}</h3><ArrowUpRight size={24} /></div></>;
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
            <div className="quest-screen-bar"><span>Side quests / {hobby.number}</span><button ref={closeButton} onClick={close} aria-label="Back to the card deck"><X size={18} /> Back to the deck</button></div>
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

/**
 * Each open card gets its own address (#side-quests/<id>), so a hobby can be
 * linked to, and the back button closes the card instead of leaving the site.
 */
export default function Hobbies() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [closeRequest, setCloseRequest] = useState(0);
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  // Whether opening the card added a history entry that closing should undo.
  const pushed = useRef(false);

  const open = (hobby: Hobby, trigger: HTMLButtonElement, push = true) => {
    if (push) { history.pushState({ sideQuest: hobby.id }, '', HASH + hobby.id); pushed.current = true; }
    setSelection({ hobby, rect: trigger.getBoundingClientRect(), trigger });
  };

  useEffect(() => {
    const fromHash = () => {
      const id = location.hash.startsWith(HASH) ? location.hash.slice(HASH.length) : '';
      return hobbies.find(h => h.id === id);
    };
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
  }, []);

  const closed = (jumpTo?: string) => {
    setSelection(null);
    if (jumpTo) history.replaceState(null, '', jumpTo);
    else if (pushed.current) history.back();
    else if (location.hash.startsWith(HASH)) history.replaceState(null, '', location.pathname + location.search);
    pushed.current = false;
  };

  return <><div className="quest-deck">{hobbies.map((hobby, i) => <button key={hobby.id} ref={el => { cards.current[hobby.id] = el; }} className="quest-card" style={{ '--quest-color': hobby.color, '--card-index': i, '--card-angle': `${(i - 1.5) * 7}deg` } as React.CSSProperties} onClick={event => open(hobby, event.currentTarget)} aria-label={`Open ${hobby.name}`} aria-haspopup="dialog"><CardFace hobby={hobby} /></button>)}</div><p className="quest-caption">Pick a card. There’s a little more on the other side.</p>{selection && <React.Fragment key={selection.hobby.id}><HobbyScreen selection={selection} onClose={closed} closeRequest={closeRequest} /></React.Fragment>}</>;
}
