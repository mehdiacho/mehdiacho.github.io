import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useProjects } from '../lib/projects-store';
import { Project, ProjectCategory, ProjectStatus } from '../types';

/** Plain words again. "WIP" means nothing to someone outside software. */
const CATEGORY_META: Record<ProjectCategory, { label: string; filter: string }> = {
  ai: { label: 'AI & research', filter: 'AI & research' },
  tools: { label: 'Tool / app', filter: 'Tools & apps' },
  games: { label: 'Game', filter: 'Games' },
};

const STATUS_META: Record<ProjectStatus, { label: string }> = {
  live: { label: 'Live' },
  wip: { label: 'In progress' },
  concept: { label: 'Planned' },
};

/**
 * Titles are stored SHOUTED_WITH_UNDERSCORES — that was the terminal theme's
 * voice, and they are edited in Firestore, so they cannot simply be renamed
 * in this repo. They are formatted for display instead: underscores become
 * spaces, and the handful of names that are not plain words are spelled out.
 */
const NAME_OVERRIDES: Record<string, string> = {
  YAP: 'Yap',
  TETHER: 'Tether',
  DITHER: 'Dither',
  MACHINE_STRIKE: 'Machine Strike',
  GRIDS_TO_GRAPHS: 'Grids to Graphs',
  FPX_NOW: 'FPX Now',
  FILMARR: 'Filmarr',
  KINKEEP: 'Kin Keep',
  SECURE_VAULT: 'Secure Vault',
  HIGHRISE: 'Highrise',
  FISH_PLAYER: 'Fish Player',
  BLACKWALL: 'Blackwall',
  DRAFTING_TABLE: 'Drafting Table',
  TALLY: 'Tally',
  BIBVERIFY: 'BibVerify',
  AISTUDIO_SYNC: 'AI Studio Sync',
  A_TESTERS: 'A-Testers',
  SMARTSPEND: 'SmartSpend',
  MMILA: 'Mmila',
  AGENTIC_BROWSER: 'Agentic Browser',
};

const prettyTitle = (title: string): string => {
  const known = NAME_OVERRIDES[title];
  if (known) return known;
  // A title typed in admin with its own casing ("Zeus FDR") is shown as
  // typed. Only the old SHOUTED_STYLE gets the safe part of the job done.
  if (/[a-z]/.test(title)) return title.replace(/_/g, ' ');
  const words = title.replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Two rows of four on a desktop, so a page still reads as a crate rather than a wall. */
const PER_PAGE = 8;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Every way into a project: its own call to action, the deploy and the source. */
const ProjectLinks: React.FC<{ project: Project; className: string }> = ({ project, className }) => {
  const links: React.ReactNode[] = [];

  if (project.action) {
    links.push(
      project.action.vault ? (
        <button
          key="action"
         
          onClick={() =>
            window.dispatchEvent(new CustomEvent('vault:open', { detail: { tab: 'send' } }))
          }
        >
          {project.action.text}
        </button>
      ) : (
        <a key="action" href={project.action.href} target="_blank" rel="noopener noreferrer">
          {project.action.text} &rarr;
        </a>
      ),
    );
  }
  if (project.link) {
    links.push(
      <a key="visit" href={project.link} target="_blank" rel="noopener noreferrer">
        Visit &rarr;
      </a>,
    );
  }
  if (project.github) {
    links.push(
      <a key="source" href={project.github} target="_blank" rel="noopener noreferrer">
        Source &rarr;
      </a>,
    );
  }
  // Private source with nothing public to click — say so rather than
  // letting real work read as unstarted.
  if (project.private && !project.github) {
    links.push(
      <span key="private" title="Private repository, happy to walk through it">
        Source on request
      </span>,
    );
  }

  return links.length ? <div className={className}>{links}</div> : null;
};

/**
 * The front of the sleeve. A square poster is used as it is; without one the
 * sleeve is laid out around the wide card cover, so every project already in
 * Firestore has a proper front without anyone redrawing its art.
 */
const SleeveArt: React.FC<{ project: Project }> = ({ project }) => {
  const title = prettyTitle(project.title);
  const category = project.category ?? 'tools';

  if (project.poster) {
    return (
      <>
        <img className="sleeve-poster" src={project.poster} alt="" loading="lazy" decoding="async" />
        <span className="sleeve-title-strip">{title}</span>
      </>
    );
  }

  return (
    <div className="sleeve-layout">
      <p className="sleeve-meta">
        <span>{project.id}</span>
        <span>{CATEGORY_META[category].label}</span>
      </p>
      <div className="sleeve-band">
        <img src={project.image} alt="" loading="lazy" decoding="async" />
      </div>
      <p className="sleeve-title">{title}</p>
    </div>
  );
};

const Record: React.FC<{
  project: Project;
  flipped: boolean;
  playing: boolean;
  onFlip: (id: string | null) => void;
  onPlay: (project: Project) => void;
  frontRef: (el: HTMLButtonElement | null) => void;
}> = ({ project, flipped, playing, onFlip, onPlay, frontRef }) => {
  const title = prettyTitle(project.title);
  const category = project.category ?? 'tools';
  const status = STATUS_META[project.status];
  const playButton = useRef<HTMLButtonElement>(null);
  const wasFlipped = useRef(flipped);

  // Turning the sleeve over moves focus with it, so a keyboard user lands
  // on the side they asked to see.
  useEffect(() => {
    if (flipped && !wasFlipped.current) {
      window.setTimeout(() => playButton.current?.focus({ preventScroll: true }), reducedMotion() ? 0 : 320);
    }
    wasFlipped.current = flipped;
  }, [flipped]);

  return (
    <li
      className="record"
      data-category={category}
      data-flipped={flipped || undefined}
      data-playing={playing || undefined}
    >
      <span className="record-disc" aria-hidden="true">
        <span className="vinyl-label" />
      </span>

      <div className="sleeve">
        <button
          ref={frontRef}
          type="button"
          className="sleeve-face sleeve-front"
          onClick={() => onFlip(project.id)}
          aria-label={`${title}. Turn the sleeve over to read about it`}
          tabIndex={flipped ? -1 : undefined}
          aria-hidden={flipped || undefined}
        >
          <SleeveArt project={project} />
          <span className="sleeve-sticker" data-status={project.status}>
            {playing ? 'On the deck' : status.label}
          </span>
        </button>

        <div
          className="sleeve-face sleeve-back"
          inert={!flipped}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onFlip(null);
          }}
        >
          <div className="sleeve-back-head">
            <p className="label">
              {project.id} / {status.label}
            </p>
            <h3>{title}</h3>
          </div>
          <p className="sleeve-notes">{project.pitch}</p>
          {project.stack.length > 0 && (
            <ol className="sleeve-tracks">
              {project.stack.map((tech, index) => (
                <li key={tech}>
                  <span>A{index + 1}</span> {tech}
                </li>
              ))}
            </ol>
          )}
          <div className="sleeve-controls">
            <button ref={playButton} type="button" className="sleeve-play" onClick={() => onPlay(project)}>
              <span aria-hidden="true">&#9654;</span> {playing ? 'Playing' : 'Play'}
            </button>
            <button type="button" className="sleeve-turn" onClick={() => onFlip(null)}>
              Turn back
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

/**
 * The turntable. Empty until a record is played; then the record drops onto
 * the platter, the arm comes across, and the screen beside it shows the
 * project properly — the full notes and every way into it.
 */
const Player: React.FC<{ project: Project | null; onEject: () => void; headingRef: React.Ref<HTMLHeadingElement> }> = ({
  project,
  onEject,
  headingRef,
}) => {
  const category = project?.category ?? 'tools';

  return (
    <section className="player" aria-label="Record player" data-loaded={project ? true : undefined}>
      <div className="deck" data-category={category} aria-hidden="true">
        <div className="platter">
          {/* Keyed on the project so changing records replays the drop. */}
          {project && (
            <div key={project.id} className="deck-vinyl">
              <span className="vinyl-label">
                <span>{prettyTitle(project.title)}</span>
                <span>{project.id}</span>
              </span>
            </div>
          )}
          <span className="spindle" />
        </div>
        <div className="tonearm">
          <span className="tonearm-pivot" />
          <span className="tonearm-arm" />
        </div>
        <span className="deck-light" />
        <span className="deck-badge">33&#8531;</span>
      </div>

      <div className="player-screen" aria-live="polite">
        {project ? (
          <>
            <p className="label">
              Now playing / {project.id} / {CATEGORY_META[category].label} / {STATUS_META[project.status].label}
            </p>
            <h3 ref={headingRef} tabIndex={-1}>
              {prettyTitle(project.title)}
            </h3>
            <img className="player-cover" src={project.poster ?? project.image} alt={`Cover art for ${prettyTitle(project.title)}`} />
            <p className="player-notes">{project.pitch}</p>
            {project.stack.length > 0 && (
              <ul className="player-stack">
                {project.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            )}
            <div className="player-actions">
              <ProjectLinks project={project} className="player-links" />
              <button type="button" className="player-eject" onClick={onEject}>
                Eject
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="label">Nothing on the deck</p>
            <h3 ref={headingRef} tabIndex={-1}>
              Pick a record.
            </h3>
            <p className="player-notes">
              Each sleeve in the crate below is a project. Turn one over to read the back, then press play to put it on.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

const arrowClass =
  'flex h-12 w-12 items-center justify-center border border-ink text-xl leading-none text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-rule-soft disabled:text-ink-faint disabled:hover:bg-transparent';

/**
 * The projects as a crate of records, eight at a time.
 *
 * Each project is a sleeve: art on the front, the description on the back.
 * Selecting a sleeve turns it over; Play puts the record on the turntable
 * above the crate, which is where the project is shown in full.
 */
const Projects: React.FC = () => {
  const { projects } = useProjects();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('All work');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const fronts = useRef<Record<string, HTMLButtonElement | null>>({});
  const player = useRef<HTMLDivElement>(null);
  const playerHeading = useRef<HTMLHeadingElement>(null);

  const filters = ['All work', 'AI & research', 'Tools & apps', 'Games'];
  const filtered = projects.filter(
    (p) => filter === 'All work' || CATEGORY_META[p.category ?? 'tools'].filter === filter,
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // Firestore can return fewer projects than the page we are sitting on.
  const current = Math.min(page, pages - 1);

  const slice = useMemo(
    () => filtered.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE),
    [filtered, current],
  );

  // The playing record survives the list being swapped for the published one.
  const playing = projects.find((p) => p.id === playingId) ?? null;

  const flip = (id: string | null) => {
    const previous = flippedId;
    setFlippedId(id);
    // Turning a sleeve back hands focus to its front again.
    if (id === null && previous) fronts.current[previous]?.focus({ preventScroll: true });
  };

  const play = (project: Project) => {
    setPlayingId(project.id);
    setFlippedId(null);
    requestAnimationFrame(() => {
      player.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      playerHeading.current?.focus({ preventScroll: true });
    });
  };

  const eject = () => {
    const id = playingId;
    setPlayingId(null);
    if (id) fronts.current[id]?.focus({ preventScroll: true });
  };

  const turnPage = (next: number) => {
    setPage(next);
    setFlippedId(null);
  };

  if (projects.length === 0) return null;

  return (
    <div className="records">
      <div className="project-toolbar">
        <div role="group" aria-label="Filter projects">
          {filters.map((name) => (
            <button
              key={name}
              aria-pressed={filter === name}
              onClick={() => {
                setFilter(name);
                turnPage(0);
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <p className="label" role="status">
          {filtered.length} records / {filter}
        </p>
      </div>

      <div ref={player} className="player-anchor">
        <Player project={playing} onEject={eject} headingRef={playerHeading} />
      </div>

      <ul className="crate list-none p-0">
        {slice.map((project) => (
          <Record
            key={project.id}
            project={project}
            flipped={flippedId === project.id}
            playing={playingId === project.id}
            onFlip={flip}
            onPlay={play}
            frontRef={(el) => {
              fronts.current[project.id] = el;
            }}
          />
        ))}
      </ul>
      {filtered.length === 0 && <p>No records in this group yet.</p>}

      {pages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-ink pt-6">
          <p className="label m-0 text-ink-soft" aria-live="polite">
            Crate {current + 1} of {pages}
            <span className="sr-only">
              {' '}
              — showing {slice.length} of {filtered.length} projects
            </span>
          </p>

          <div className="flex items-center gap-3">
            {/* Dots first, so the arrows stay at the end of the row where a
                thumb expects them. */}
            <div className="mr-2 hidden items-center gap-2 sm:flex">
              {Array.from({ length: pages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => turnPage(index)}
                  aria-label={`Go to crate ${index + 1}`}
                  aria-current={index === current ? 'true' : undefined}
                  className={`h-3 w-3 border border-ink transition-colors ${
                    index === current ? 'bg-accent' : 'bg-transparent hover:bg-ink'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => turnPage(current - 1)}
              disabled={current === 0}
              aria-label="Previous crate of records"
              className={arrowClass}
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => turnPage(current + 1)}
              disabled={current === pages - 1}
              aria-label="Next crate of records"
              className={arrowClass}
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
