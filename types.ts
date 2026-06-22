export type ProjectStatus = 'live' | 'wip' | 'concept';

export interface Project {
  id: string;
  title: string;
  pitch: string;
  stack: string[];
  image: string;
  link?: string;
  github?: string;
  /**
   * Honest build state. Drives the badge shown on the card.
   * 'live'    - shipped, has a real demo/source
   * 'wip'     - actively being built
   * 'concept' - idea / not started yet (placeholder)
   */
  status: ProjectStatus;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: 'language' | 'framework' | 'core';
}

export interface TerminalLine {
  type: 'input' | 'output' | 'system';
  content: string;
  isHtml?: boolean;
}