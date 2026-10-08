import React from 'react';

import { useProjects } from '../lib/projects-store';
import { Project, ProjectStatus } from '../types';

/** Plain words again. "WIP" means nothing to someone outside software. */
const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'border-green-800/40 text-green-800' },
  wip: { label: 'In progress', className: 'border-amber-700/40 text-amber-700' },
  concept: { label: 'Planned', className: 'border-rule text-ink-faint' },
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

const linkClass =
  'border-b border-rule pb-0.5 font-label text-[12px] text-ink-soft transition-colors hover:border-blue hover:text-blue';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const status = STATUS_META[project.status];

  return (
    <li className="flex flex-col border-2 border-ink bg-paper-lift">
      <div className="relative h-28 overflow-hidden border-b-2 border-ink bg-white">
        <img
          src={project.image}
          alt={`Cover illustration for ${prettyTitle(project.title)}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">
            {prettyTitle(project.title)}
          </h3>
          <span className={`border px-2 py-0.5 label ${status.className}`}>
            {status.label}
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
          {project.pitch}
        </p>

        {project.stack.length > 0 && (
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

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
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
                {project.action.text} →
              </a>
            ))}

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Visit →
            </a>
          )}

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Source →
            </a>
          )}

          {/* Private source with nothing public to click — say so rather than
              letting real work read as unstarted. */}
          {project.private && !project.github && (
            <span
              className="font-label text-[12px] text-ink-faint"
              title="Private repository — happy to walk through it"
            >
              Source on request
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

const Projects: React.FC = () => {
  const { projects } = useProjects();

  return (
    <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </ul>
  );
};

export default Projects;
