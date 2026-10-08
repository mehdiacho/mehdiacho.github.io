import React, { useMemo, useState } from 'react';

import { useProjects } from '../lib/projects-store';
import { Project, ProjectStatus } from '../types';

/** Plain words again. "WIP" means nothing to someone outside software. */
const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'text-accent' },
  wip: { label: 'In progress', className: 'text-ink-soft' },
  concept: { label: 'Planned', className: 'text-ink-faint' },
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
  // Unknown name from Firestore: do the safe part of the job only.
  const words = title.replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * The shape of one page of the grid.
 *
 * Seven cells that tile a twelve-column grid exactly: a big one and a tall
 * one across the top, a row of three, then a wide one and a small one. The
 * sizes are what makes it a bento rather than a row of equal cards, and
 * because the pattern repeats, every page is composed the same way instead
 * of being whatever twenty cards happened to fall into.
 */
const SPANS = ['hero', 'tall', 'small', 'small', 'small', 'wide', 'small'] as const;
const PER_PAGE = SPANS.length;

const linkClass =
  'border-b border-rule-soft pb-0.5 font-label text-[12px] text-ink-soft transition-colors hover:border-accent hover:text-accent';

const ProjectCard: React.FC<{ project: Project; span: string }> = ({ project, span }) => {
  const status = STATUS_META[project.status];
  const roomy = span === 'hero' || span === 'tall';

  return (
    <li data-span={span} className="panel-lift flex min-h-0 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-hidden border-b border-rule bg-white">
        <img
          src={project.image}
          alt={`Cover illustration for ${prettyTitle(project.title)}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className={`stamp absolute left-3 top-3 bg-paper-lift ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex shrink-0 flex-col p-5">
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink">
          {prettyTitle(project.title)}
        </h3>

        <p
          className={`mt-2 text-sm leading-relaxed text-ink-soft ${
            roomy ? 'line-clamp-6' : 'line-clamp-3'
          }`}
        >
          {project.pitch}
        </p>

        {roomy && project.stack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5 p-0 list-none">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="border border-rule-soft px-1.5 py-0.5 font-label text-[11px] text-ink-faint"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {project.action &&
            (project.action.vault ? (
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('vault:open', { detail: { tab: 'send' } }),
                  )
                }
                className={linkClass}
              >
                {project.action.text}
              </button>
            ) : (
              <a
                href={project.action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {project.action.text} &rarr;
              </a>
            ))}

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Visit &rarr;
            </a>
          )}

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Source &rarr;
            </a>
          )}

          {/* Private source with nothing public to click — say so rather than
              letting real work read as unstarted. */}
          {project.private && !project.github && (
            <span
              className="font-label text-[12px] text-ink-faint"
              title="Private repository, happy to walk through it"
            >
              Source on request
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

const arrowClass =
  'flex h-12 w-12 items-center justify-center border border-ink text-xl leading-none text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-rule-soft disabled:text-ink-faint disabled:hover:bg-transparent';

/**
 * Twenty projects in a bento grid, seven at a time.
 *
 * Paged rather than scrolled: twenty cards in one go is a wall, and a
 * sideways scroller is worse — he asked for arrows and pages, so that is
 * what this is. The page changes in place, the heading above it says which
 * page you are on, and the whole thing is announced to a screen reader.
 */
const Projects: React.FC = () => {
  const { projects } = useProjects();
  const [page, setPage] = useState(0);

  const pages = Math.max(1, Math.ceil(projects.length / PER_PAGE));
  // Firestore can return fewer projects than the page we are sitting on.
  const current = Math.min(page, pages - 1);

  const slice = useMemo(
    () => projects.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE),
    [projects, current],
  );

  if (projects.length === 0) return null;

  return (
    <div>
      <ul className="bento list-none p-0">
        {slice.map((project, index) => (
          <ProjectCard key={project.id} project={project} span={SPANS[index]} />
        ))}
      </ul>

      {pages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-ink pt-6">
          <p className="label m-0 text-ink-soft" aria-live="polite">
            Page {current + 1} of {pages}
            <span className="sr-only">
              {' '}
              — showing {slice.length} of {projects.length} projects
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
                  onClick={() => setPage(index)}
                  aria-label={`Go to page ${index + 1}`}
                  aria-current={index === current ? 'true' : undefined}
                  className={`h-3 w-3 border border-ink transition-colors ${
                    index === current ? 'bg-accent' : 'bg-transparent hover:bg-ink'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              aria-label="Previous page of projects"
              className={arrowClass}
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current === pages - 1}
              aria-label="Next page of projects"
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
