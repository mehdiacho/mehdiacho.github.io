import React from 'react';

import { useProjects } from '../lib/projects-store';
import { Project } from '../types';

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

const openVault = () => window.dispatchEvent(new CustomEvent('vault:open', { detail: { tab: 'send' } }));

/** Every way into a project: its own call to action, the deploy and the source. */
const ProjectLinks: React.FC<{ project: Project }> = ({ project }) => {
  const links: React.ReactNode[] = [];
  if (project.action) {
    links.push(project.action.vault
      ? <button key="action" type="button" onClick={openVault}>{project.action.text}</button>
      : <a key="action" href={project.action.href} target="_blank" rel="noopener noreferrer">{project.action.text} &rarr;</a>);
  }
  if (project.link) links.push(<a key="visit" href={project.link} target="_blank" rel="noopener noreferrer">Visit &rarr;</a>);
  if (project.github) links.push(<a key="source" href={project.github} target="_blank" rel="noopener noreferrer">Source &rarr;</a>);
  // Private source with nothing public to click: say so.
  if (project.private && !project.github) links.push(<span key="private" title="Private repository, happy to walk through it">Source on request</span>);
  return links.length ? <div className="work-links">{links}</div> : null;
};

/**
 * The work, as a list of rows: one finished project per row.
 *
 * Only projects marked live are shown. The list still comes from Firestore,
 * so marking a project live in admin adds its row here without a deploy.
 * Each cover sits in ink and paper until the row is hovered or focused.
 */
const Projects: React.FC = () => {
  const { projects } = useProjects();
  const live = projects.filter((p) => p.status === 'live');
  if (live.length === 0) return null;

  return (
    <ol className="work-rows">
      {live.map((project) => {
        const title = prettyTitle(project.title);
        return (
          <li key={project.id} className="work-row" data-det="project">
            <div className="work-cover"><img src={project.poster ?? project.image} alt="" loading="lazy" decoding="async" /></div>
            <div className="work-body">
              <h3>{title}</h3>
              <p>{project.pitch}</p>
              {project.stack.length > 0 && <ul className="work-stack" aria-label={`Built with`}>{project.stack.map((tech) => <li key={tech}>{tech}</li>)}</ul>}
            </div>
            <ProjectLinks project={project} />
          </li>
        );
      })}
    </ol>
  );
};

export default Projects;
