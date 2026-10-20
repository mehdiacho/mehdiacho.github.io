/**
 * The shape of a project document, and the conversions between the Firestore
 * document and the form state.
 *
 * The form works entirely in strings (that's what inputs give you) and converts
 * at the boundary. Doing it the other way round means fighting React about
 * partially-typed numbers and half-typed URLs on every keystroke.
 */

export type ProjectStatus = 'live' | 'wip' | 'concept';
/** Filter group on the site. Mirrors `ProjectCategory` in the site's types.ts. */
export type ProjectCategory = 'ai' | 'tools' | 'games';

export interface ProjectDoc {
  id: string;
  title: string;
  pitch: string;
  stack: string[];
  image: string;
  /** Square art for the record sleeve. Falls back to a layout built around `image`. */
  poster?: string;
  category: ProjectCategory;
  link?: string;
  github?: string;
  action?: { text: string; href?: string; vault?: boolean };
  private?: boolean;
  status: ProjectStatus;
  order: number;
  draft?: boolean;
  updatedAt?: unknown;
}

/** Everything the form edits, as strings/booleans. */
export interface FormState {
  docId: string;
  id: string;
  title: string;
  pitch: string;
  stack: string;
  image: string;
  poster: string;
  category: ProjectCategory;
  link: string;
  github: string;
  actionText: string;
  actionHref: string;
  actionVault: boolean;
  isPrivate: boolean;
  status: ProjectStatus;
  order: string;
  draft: boolean;
}

export const emptyForm = (order: number): FormState => ({
  docId: '',
  id: '',
  title: '',
  pitch: '',
  stack: '',
  image: '',
  poster: '',
  category: 'tools',
  link: '',
  github: '',
  actionText: '',
  actionHref: '',
  actionVault: false,
  isPrivate: false,
  status: 'wip',
  order: String(order),
  draft: false,
});

export function docToForm(docId: string, d: ProjectDoc): FormState {
  return {
    docId,
    id: d.id ?? '',
    title: d.title ?? '',
    pitch: d.pitch ?? '',
    stack: (d.stack ?? []).join(', '),
    image: d.image ?? '',
    poster: d.poster ?? '',
    category: d.category ?? 'tools',
    link: d.link ?? '',
    github: d.github ?? '',
    actionText: d.action?.text ?? '',
    actionHref: d.action?.href ?? '',
    actionVault: d.action?.vault === true,
    isPrivate: d.private === true,
    status: d.status ?? 'wip',
    order: String(d.order ?? 0),
    draft: d.draft === true,
  };
}

/**
 * Build the document to write. Optional fields are omitted rather than written
 * as empty strings — an `href: ""` would render a card with a link to nowhere.
 */
export function formToDoc(f: FormState): Omit<ProjectDoc, 'updatedAt'> {
  const t = (s: string) => s.trim();
  const doc: Omit<ProjectDoc, 'updatedAt'> = {
    id: t(f.id),
    title: t(f.title),
    pitch: t(f.pitch),
    stack: f.stack.split(',').map(t).filter(Boolean).slice(0, 4),
    image: t(f.image),
    category: f.category,
    status: f.status,
    order: Number(f.order) || 0,
  };
  if (t(f.poster)) doc.poster = t(f.poster);
  if (t(f.link)) doc.link = t(f.link);
  if (t(f.github)) doc.github = t(f.github);
  if (f.isPrivate) doc.private = true;
  if (f.draft) doc.draft = true;
  if (t(f.actionText) && (f.actionVault || t(f.actionHref))) {
    doc.action = f.actionVault
      ? { text: t(f.actionText), vault: true }
      : { text: t(f.actionText), href: t(f.actionHref) };
  }
  return doc;
}

/**
 * Front-end validation mirroring firestore.rules. The rules are the real gate;
 * this exists so a mistake reads as a field-level message instead of a
 * permission-denied error with nothing to act on.
 */
export function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  const t = (s: string) => s.trim();

  if (!t(f.id)) e.id = 'Needed — this is the code shown on the card, e.g. P21.';
  if (!t(f.title)) e.title = 'Give it a name.';
  else if (t(f.title).length > 60) e.title = 'Keep it under 60 characters.';

  if (!t(f.pitch)) e.pitch = 'One or two sentences on what it is.';
  else if (t(f.pitch).length > 600) e.pitch = 'Too long — 600 characters maximum.';

  const stack = f.stack.split(',').map(t).filter(Boolean);
  if (stack.length > 4) e.stack = 'Four tags at most — they sit in one row on the card.';

  if (!t(f.image)) e.image = 'Pick a cover image or paste a path.';

  for (const [k, v] of [['poster', f.poster], ['link', f.link], ['github', f.github], ['actionHref', f.actionHref]] as const) {
    if (t(v) && !/^https?:\/\/|^\//.test(t(v))) e[k] = 'Must start with https:// or /';
  }

  if (t(f.actionHref) && !t(f.actionText)) e.actionText = 'A link needs a button label.';
  if (t(f.actionText) && !t(f.actionHref) && !f.actionVault) {
    e.actionHref = 'Add a link, or switch the button to open the vault.';
  }
  if (f.order.trim() && Number.isNaN(Number(f.order))) e.order = 'Numbers only.';

  return e;
}

/** Every field this form owns. Anything else on a document is left as it is. */
const FORM_FIELDS = new Set([
  'id', 'title', 'pitch', 'stack', 'image', 'poster', 'category', 'link', 'github',
  'action', 'private', 'status', 'order', 'draft', 'updatedAt',
]);

/**
 * Fields on a stored document that the form doesn't know about. Saving
 * replaces the whole document (so a cleared field really is removed), and
 * without this a field added by a script or a newer version of the site
 * would be wiped by the next edit here. That's how `category` was lost.
 */
export function untouchedFields(d: ProjectDoc | undefined): Record<string, unknown> {
  if (!d) return {};
  return Object.fromEntries(Object.entries(d).filter(([k]) => !FORM_FIELDS.has(k)));
}
