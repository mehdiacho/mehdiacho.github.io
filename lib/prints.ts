import { useEffect, useState } from 'react';
import snapshot from '../content/prints.json';
import { CAD_STORIES, type CadStory } from '../cad-stories';

/**
 * The model notebook is built from the public 3d-prints manifest. Titles,
 * statuses, descriptions, renders and models come from there; the site only
 * adds the personal story and its own copy of a blueprint, keyed by the
 * manifest's slug. content/prints.json is that manifest as of the last
 * `npm run prints:sync`, which is what the pages are prerendered from.
 */
export const PRINTS_MANIFEST_URL = 'https://raw.githubusercontent.com/mehdiacho/3d-prints/main/prints.json';

export interface PrintEntry {
  slug: string;
  order: number;
  title: string;
  status: string;
  description: string;
  thumbnail: string | null;
  model: string | null;
  blueprint: string | null;
}

export interface PrintsManifest {
  repo: string;
  base: string;
  prints: PrintEntry[];
}

export interface CadEntry {
  /** The manifest's slug. */
  id: string;
  /** The site's page slug; differs where a page was published before the manifest existed. */
  slug: string;
  title: string;
  status: string;
  description: string;
  model?: string;
  poster?: string;
  alt: string;
  /** A same-origin copy of the drawing, when the site keeps one. */
  blueprint?: string;
  /** The print's folder on GitHub: drawings, STLs and build scripts. */
  source: string;
  story?: CadStory;
  /** Whether /models/<slug>/ was prerendered. Prints added upstream since the last build have no page yet. */
  hasPage: boolean;
}

const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isPath = (value: unknown) => value === null || isText(value);

export function isPrintsManifest(value: unknown): value is PrintsManifest {
  const m = value as PrintsManifest;
  return !!m && isText(m.repo) && isText(m.base) && Array.isArray(m.prints) && m.prints.every(p =>
    !!p && isText(p.slug) && isText(p.title) && isText(p.status) && typeof p.description === 'string' &&
    typeof p.order === 'number' && isPath(p.thumbnail) && isPath(p.model) && isPath(p.blueprint));
}

if (!isPrintsManifest(snapshot)) throw new Error('content/prints.json is not a prints manifest');
export const PRINTS_SNAPSHOT: PrintsManifest = snapshot;

const built = new Set(PRINTS_SNAPSHOT.prints.map(p => p.slug));
const pageSlug = (id: string) => CAD_STORIES.find(s => s.print === id)?.slug ?? id;

export function cadEntries(manifest: PrintsManifest = PRINTS_SNAPSHOT): CadEntry[] {
  const asset = (path: string | null) => path ? new URL(path, manifest.base).href : undefined;
  return [...manifest.prints].sort((a, b) => a.order - b.order).map(print => {
    const story = CAD_STORIES.find(s => s.print === print.slug);
    return {
      id: print.slug,
      slug: pageSlug(print.slug),
      title: print.title,
      status: print.status,
      description: print.description,
      model: asset(print.model),
      poster: asset(print.thumbnail),
      alt: story?.alt ?? `The ${print.title.toLowerCase()} as modelled`,
      blueprint: story?.blueprint,
      source: `https://github.com/${manifest.repo}/tree/main/prints/${print.slug}`,
      story,
      hasPage: built.has(print.slug),
    };
  });
}

/** Pages to prerender: one per print in the snapshot. */
export const CAD_PAGES = cadEntries().map(e => ({ path: `/models/${e.slug}/`, title: e.title, description: e.story?.description ?? e.description }));

/**
 * Starts from the build's snapshot, so the server and first client render
 * agree, then swaps in the live manifest if it loads. If it does not, the
 * snapshot stays.
 */
export function useCadEntries() {
  const [entries, setEntries] = useState(cadEntries);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    fetch(PRINTS_MANIFEST_URL, { signal: controller.signal, cache: 'no-cache' })
      .then(r => r.ok ? r.json() : null)
      .then(live => { if (isPrintsManifest(live) && live.prints.length) setEntries(cadEntries(live)); })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); controller.abort(); };
  }, []);
  return entries;
}
