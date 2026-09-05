/**
 * Runtime project list.
 *
 * The site is a static SPA on GitHub Pages, but the project cards are not
 * static: they're read from the `projects` collection in Firestore (project
 * `mehdi-00`) at load, so adding a project from admin.mehdiacho.tech publishes
 * it here without a rebuild or a deploy.
 *
 * The bundled `PROJECTS` array in constants.ts is the fallback, and it matters:
 * Firestore can be unreachable, blocked by a network, empty on a fresh project,
 * or rate-limited. In every one of those cases the page must still render a
 * real list rather than an empty grid — a portfolio that shows nothing is worse
 * than one showing a slightly stale list.
 *
 * Reads are public (see firestore.rules); only the owner can write.
 */
import { useEffect, useState } from 'react';
import { PROJECTS } from '../constants';
import type { Project, ProjectStatus } from '../types';

const COLLECTION = 'projects';

/** Where the list currently on screen came from. Surfaced in the terminal. */
export type ProjectSource = 'firestore' | 'fallback';

const STATUSES: ProjectStatus[] = ['live', 'wip', 'concept'];

/**
 * Firestore documents are user-entered and may predate a schema change, so
 * nothing is trusted: every field is checked, and anything unusable makes the
 * whole document fail rather than rendering a half-broken card.
 */
function toProject(id: string, raw: Record<string, unknown>): Project | null {
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

  const title = str(raw.title);
  const pitch = str(raw.pitch);
  if (!title || !pitch) return null;

  const status = STATUSES.includes(raw.status as ProjectStatus)
    ? (raw.status as ProjectStatus)
    : 'wip';

  const stack = Array.isArray(raw.stack)
    ? raw.stack.filter((s): s is string => typeof s === 'string' && !!s.trim()).slice(0, 4)
    : [];

  // An action needs a label plus somewhere to go — either a URL or the vault.
  let action: Project['action'];
  const rawAction = raw.action as Record<string, unknown> | undefined;
  if (rawAction && typeof rawAction === 'object') {
    const text = str(rawAction.text);
    const href = str(rawAction.href);
    const vault = rawAction.vault === true;
    if (text && (href || vault)) action = vault ? { text, vault: true } : { text, href };
  }

  return {
    id: str(raw.id) ?? id,
    title,
    pitch,
    stack,
    image: str(raw.image) ?? '/covers/placeholder.svg',
    link: str(raw.link),
    github: str(raw.github),
    action,
    private: raw.private === true,
    status,
    order: typeof raw.order === 'number' ? raw.order : undefined,
  };
}

/**
 * Fetch the published project list. Resolves to the fallback rather than
 * rejecting — callers should never have to handle an error to show a page.
 */
export async function fetchProjects(): Promise<{ projects: Project[]; source: ProjectSource }> {
  try {
    const [{ initializeApp, getApps }, { getFirestore, collection, getDocs }] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
    ]);
    const { firebaseConfig } = await import('./firebase');

    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    const snap = await getDocs(collection(getFirestore(app), COLLECTION));

    const rows = snap.docs
      .map((d) => toProject(d.id, d.data() as Record<string, unknown>))
      .filter((p): p is Project => p !== null)
      // `draft` documents are filtered by the query consumer, not here — the
      // rules keep them readable so the admin can list them.
      .filter((p) => !(p as Project & { draft?: boolean }).draft);

    if (!rows.length) return { projects: PROJECTS, source: 'fallback' };

    rows.sort((a, b) => {
      const ao = a.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order ?? Number.MAX_SAFE_INTEGER;
      return ao === bo ? a.id.localeCompare(b.id) : ao - bo;
    });

    return { projects: rows, source: 'firestore' };
  } catch (err) {
    console.warn('[projects] falling back to the bundled list:', err);
    return { projects: PROJECTS, source: 'fallback' };
  }
}

/**
 * Projects for rendering. Starts on the bundled list so the grid paints
 * immediately and is never empty, then swaps in the published list once it
 * arrives.
 */
export function useProjects(): { projects: Project[]; source: ProjectSource; loading: boolean } {
  const [state, setState] = useState<{ projects: Project[]; source: ProjectSource }>({
    projects: PROJECTS,
    source: 'fallback',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetchProjects().then((res) => {
      if (!live) return;
      setState(res);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  return { ...state, loading };
}
