export type ProjectStatus = 'live' | 'wip' | 'concept';

/**
 * A card's call to action. Ultimately everything is a link plus a label — the
 * label matters because "Launch" and "Join the test" are not the same promise.
 *
 * `vault` is the one exception: an in-site action (opens SECURE_VAULT) rather
 * than a navigation. When it's set, `href` is ignored.
 */
export interface ProjectAction {
  /** Button label. Kept short — it sits in a row with SOURCE and DEPLOY. */
  text: string;
  /** Where it goes. Required unless `vault` is set. */
  href?: string;
  /** Opens the in-site SECURE_VAULT modal instead of navigating. */
  vault?: boolean;
}

export interface Project {
  id: string;
  title: string;
  pitch: string;
  stack: string[];
  image: string;
  link?: string;
  github?: string;
  /**
   * Primary call to action, when the card has one that isn't just "here's the
   * source" or "here's the deploy" — a Play tester flow, a docs site, a demo.
   */
  action?: ProjectAction;
  /**
   * The source lives in a private repo. Says so on the card instead of leaving
   * it looking unstarted — several of these are client or pre-release work.
   */
  private?: boolean;
  /**
   * Honest build state. Drives the badge shown on the card.
   * 'live'    - shipped, has a real demo/source
   * 'wip'     - actively being built
   * 'concept' - idea / not started yet (placeholder)
   */
  status: ProjectStatus;
  /**
   * Sort key. Only set on documents coming from Firestore, where insertion
   * order means nothing; the local fallback list is already in display order.
   */
  order?: number;
  /** Hidden from the site without being deleted. Firestore-managed only. */
  draft?: boolean;
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
