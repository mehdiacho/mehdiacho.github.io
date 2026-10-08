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

/**
 * One thing Mehdi is hired to do. Short enough to sit in the hero card without
 * pushing the contact buttons below the fold.
 */
export interface Service {
  name: string;
  detail: string;
  /** The crawlable page that covers this in depth, if there is one. */
  href?: string;
  /** Link label. Written as a phrase, not "read more". */
  linkText?: string;
}

/**
 * A piece of 3D / CAD work: a modelled part, a dimensioned blueprint, or both.
 *
 * `image` is the still that goes in the grid and is the only thing most
 * visitors will ever load. `model` is optional and costs a megabyte of viewer,
 * so it is fetched on request rather than on page load.
 */
export interface Work3D {
  id: string;
  title: string;
  /** What it is and why it was made. One or two sentences. */
  caption: string;
  /** Still image, served from `/portfolio-3d/`. */
  image: string;
  /**
   * Written for someone who cannot see it. Describes what the drawing or
   * render actually shows, not just what the part is called — the title and
   * caption already say that.
   */
  alt: string;
  /** Optional `.glb` in `/portfolio-3d/`. Shows a "VIEW_3D" button when set. */
  model?: string;
  /** Material, process, tooling — the facts a print shop would ask for. */
  specs?: string[];
  status: ProjectStatus;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

/**
 * A named group of tools. Replaced an earlier `Skill` type that carried a
 * 0-100 `level`; those numbers were invented and are not missed.
 */
export interface ToolGroup {
  group: string;
  items: string[];
}

