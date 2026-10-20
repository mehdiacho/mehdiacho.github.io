import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut, type User,
} from 'firebase/auth';
import {
  collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import {
  AlertCircle, Check, ExternalLink, Eye, EyeOff, Github, Loader2, LogOut,
  Plus, Save, Trash2, Upload, X,
} from 'lucide-react';

import { compressImage, formatBytes, MEDIA_BOX } from './compress';
import { auth, db, googleProvider, OWNER_EMAIL, storage } from './firebase';
import {
  docToForm, emptyForm, formToDoc, untouchedFields, validate,
  type FormState, type ProjectCategory, type ProjectDoc, type ProjectStatus,
} from './model';

const COLLECTION = 'projects';
const SITE = 'https://mehdiacho.tech';

const STATUS: { value: ProjectStatus; label: string; cls: string }[] = [
  { value: 'live', label: 'LIVE', cls: 'border-green-800 text-green-400' },
  { value: 'wip', label: 'WIP', cls: 'border-amber-800 text-amber-400' },
  { value: 'concept', label: 'CONCEPT', cls: 'border-zinc-700 text-zinc-400' },
];

// Same groups and wording as the filter buttons on the site.
const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'ai', label: 'AI & research' },
  { value: 'tools', label: 'Tools & apps' },
  { value: 'games', label: 'Games' },
];

type MediaField = 'image' | 'poster';

/** Give up on an upload after this long rather than spin for the SDK's ten minutes. */
const UPLOAD_TIMEOUT_MS = 45_000;

/** Turn a Storage failure into something that says what to do next. */
function uploadErrorMessage(err: unknown): string {
  const code = (err as { code?: string }).code ?? '';
  if (code === 'storage/canceled' || code === 'storage/retry-limit-exceeded') {
    return 'Upload timed out: image storage is not reachable. Paste an image path instead for now.';
  }
  if (code === 'storage/unauthorized') return 'Upload refused by the storage rules (images under 5 MB only).';
  if (code === 'storage/bucket-not-found' || code === 'storage/project-not-found') {
    return 'There is no storage bucket on this project yet. Paste an image path instead for now.';
  }
  return `Upload failed: ${(err as Error).message}`;
}

/* ------------------------------------------------------------------ atoms -- */

const label = 'block font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 mb-1.5';
const input =
  'w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 ' +
  'placeholder:text-zinc-700 focus:outline-none focus:border-cyan-600 transition-colors';

function Field({
  id, children, error, hint,
}: { id: string; children: ReactNode; error?: string; hint?: string }) {
  return (
    <div>
      {children}
      {error ? (
        <p id={`${id}-err`} className="flex items-center gap-1.5 mt-1 text-xs text-red-400">
          <AlertCircle size={12} /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-600">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------- app -- */

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');

  const [rows, setRows] = useState<{ docId: string; data: ProjectDoc }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState<MediaField | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);

  const isOwner = !!user && user.email === OWNER_EMAIL;

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); }), []);

  const flash = useCallback((m: string) => {
    setToast(m);
    // Long messages are errors with something to act on: leave them up longer.
    window.setTimeout(() => setToast(''), Math.max(3200, m.length * 70));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const list = snap.docs.map((d) => ({ docId: d.id, data: d.data() as ProjectDoc }));
      list.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
      setRows(list);
    } catch (err) {
      flash(`Could not load projects: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => { if (isOwner) void load(); }, [isOwner, load]);

  const nextOrder = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => r.data.order ?? 0)) + 1 : 1),
    [rows],
  );

  /* ------------------------------------------------------------- actions -- */

  async function handleSignIn() {
    setAuthError('');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user.email !== OWNER_EMAIL) {
        await signOut(auth);
        setAuthError(`${cred.user.email} can't edit this site. Sign in as ${OWNER_EMAIL}.`);
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setAuthError((err as Error).message);
    }
  }

  function edit(docId: string, data: ProjectDoc) {
    setErrors({});
    setForm(docToForm(docId, data));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!form) return;
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) { flash('Fix the highlighted fields.'); return; }

    setSaving(true);
    try {
      // The catalogue number (P07) is the document id, so a rename moves the document
      // rather than leaving a duplicate behind.
      const targetId = form.id.trim();
      const original = rows.find((r) => r.docId === form.docId)?.data;
      const payload = {
        ...untouchedFields(original),
        ...formToDoc(form),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, COLLECTION, targetId), payload);
      if (form.docId && form.docId !== targetId) await deleteDoc(doc(db, COLLECTION, form.docId));
      flash(`Saved ${targetId}. Live on the site on next load.`);
      setForm(null);
      await load();
    } catch (err) {
      flash(`Save failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  async function remove(docId: string, title: string) {
    if (!window.confirm(`Delete ${title}? This removes it from the live site.`)) return;
    try {
      await deleteDoc(doc(db, COLLECTION, docId));
      if (form?.docId === docId) setForm(null);
      flash(`Deleted ${title}.`);
      await load();
    } catch (err) {
      flash(`Delete failed: ${(err as Error).message}`);
    }
  }

  async function upload(file: File, field: MediaField) {
    if (!form) return;
    setUploading(field);
    try {
      const small = await compressImage(file, MEDIA_BOX[field]);
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
      const path = `covers/${Date.now()}-${base}.${small.ext}`;
      const task = uploadBytesResumable(ref(storage, path), small.blob, {
        contentType: small.type,
        cacheControl: 'public, max-age=31536000, immutable',
      });
      const timer = window.setTimeout(() => task.cancel(), UPLOAD_TIMEOUT_MS);
      try {
        await task;
      } finally {
        window.clearTimeout(timer);
      }
      const url = await getDownloadURL(task.snapshot.ref);
      setForm((f) => (f ? { ...f, [field]: url } : f));
      const what = field === 'poster' ? 'Sleeve art' : 'Cover';
      flash(small.after < small.before
        ? `${what} uploaded, ${formatBytes(small.before)} → ${formatBytes(small.after)}.`
        : `${what} uploaded.`);
    } catch (err) {
      flash(uploadErrorMessage(err));
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = '';
      if (posterRef.current) posterRef.current.value = '';
    }
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  /** One image field: a path box, an upload button and a thumbnail. */
  function mediaInput(
    field: MediaField, inputRef: RefObject<HTMLInputElement | null>,
    title: string, hint: string, placeholder: string,
  ) {
    const value = form?.[field] ?? '';
    return (
      <div className="md:col-span-2">
        <Field id={field} error={errors[field]} hint={hint}>
          <label htmlFor={field} className={label}>{title}</label>
          <div className="flex gap-2">
            <input id={field} className={input} placeholder={placeholder}
                   value={value} onChange={(e) => set(field, e.target.value)} />
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                   className="hidden"
                   onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], field)} />
            <button
              onClick={() => inputRef.current?.click()} disabled={!!uploading}
              className="flex items-center gap-2 shrink-0 border border-zinc-800 px-3 font-mono text-[11px] uppercase text-zinc-400 hover:text-cyan-400 hover:border-cyan-700 transition-colors disabled:opacity-50"
            >
              {uploading === field ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading === field ? 'Uploading' : 'Upload'}
            </button>
          </div>
        </Field>
        {value && (
          <img src={value} alt={`${title} preview for ${form?.title || 'this project'}`}
               className={`mt-3 border border-zinc-800 object-cover ${
                 field === 'poster' ? 'h-32 w-32' : 'h-24 w-full max-w-md'}`} />
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------- gates -- */

  if (!authReady) {
    return (
      <Shell>
        <div className="flex items-center gap-3 text-zinc-500 font-mono text-sm">
          <Loader2 className="animate-spin" size={16} /> Checking your session…
        </div>
      </Shell>
    );
  }

  if (!isOwner) {
    return (
      <Shell>
        <div className="max-w-sm border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="font-mono text-lg text-zinc-100 mb-1">Portfolio Admin</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Sign in to add and edit the projects on mehdiacho.tech.
          </p>
          <button
            onClick={handleSignIn}
            className="w-full bg-cyan-950/40 border border-cyan-800 text-cyan-300 px-4 py-3 font-mono text-xs uppercase tracking-wider hover:border-cyan-500 hover:bg-cyan-900/40 transition-colors"
          >
            Continue with Google
          </button>
          {authError && (
            <p className="flex items-start gap-2 mt-4 text-xs text-red-400">
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {authError}
            </p>
          )}
        </div>
      </Shell>
    );
  }

  /* --------------------------------------------------------------- main -- */

  return (
    <Shell>
      <header className="flex flex-wrap items-center gap-4 border-b border-zinc-800 pb-4 mb-8">
        <div>
          <h1 className="font-mono text-xl text-zinc-100 tracking-tight">Portfolio Admin</h1>
          <p className="font-mono text-[11px] text-zinc-600 mt-0.5">
            {rows.length} project{rows.length === 1 ? '' : 's'} · writing to mehdi-00/projects
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <a
            href={SITE} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 border border-zinc-800 px-3 py-2 font-mono text-[11px] uppercase text-zinc-400 hover:text-cyan-400 hover:border-cyan-700 transition-colors"
          >
            <ExternalLink size={13} /> View site
          </a>
          <button
            onClick={() => { setForm(emptyForm(nextOrder)); setErrors({}); }}
            className="flex items-center gap-2 bg-cyan-950/40 border border-cyan-800 text-cyan-300 px-3 py-2 font-mono text-[11px] uppercase hover:border-cyan-500 transition-colors"
          >
            <Plus size={13} /> New project
          </button>
          <button
            onClick={() => signOut(auth)}
            title="Sign out"
            className="border border-zinc-800 p-2 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {form && (
        <section className="border border-cyan-900/60 bg-zinc-900 mb-10">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2.5">
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-500">
              {form.docId ? `Editing ${form.docId}` : 'New project'}
            </h2>
            <button onClick={() => setForm(null)} className="text-zinc-600 hover:text-zinc-300">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="grid gap-8">
              {/* ---------------------------------------------- sleeve front -- */}
              <Group title="Sleeve front" note="What a visitor sees in the crate before touching anything.">
                <div className="md:col-span-2">
                  <Field id="title" error={errors.title} hint="Printed across the sleeve and in the player. Shown as typed.">
                    <label htmlFor="title" className={label}>Title</label>
                    <input id="title" className={input} placeholder="Machine Strike" value={form.title}
                           onChange={(e) => set('title', e.target.value)} />
                  </Field>
                </div>
                {mediaInput('poster', posterRef, 'Sleeve art',
                  'Square art that fills the whole front. Optional: without it the sleeve is laid out around the cover image. Resized to 900px WebP on upload.',
                  'Square image, 1:1')}
                {mediaInput('image', fileRef, 'Cover image',
                  'The wide band on the sleeve (about 3:1) and the strip in the player. Resized to 1200px WebP on upload.',
                  '/covers/machine-strike.svg')}
              </Group>

              {/* ----------------------------------------------- sleeve back -- */}
              <Group title="Sleeve back" note="What turning the record over shows.">
                <Field id="id" error={errors.id} hint="On the sticker and the back. Also the document id.">
                  <label htmlFor="id" className={label}>Catalogue number</label>
                  <input id="id" className={input} placeholder="P21" value={form.id}
                         onChange={(e) => set('id', e.target.value)} />
                </Field>

                <div>
                  <span className={label}>Status sticker</span>
                  <div className="flex gap-2">
                    {STATUS.map((s) => (
                      <button
                        key={s.value} onClick={() => set('status', s.value)}
                        aria-pressed={form.status === s.value}
                        className={`border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          form.status === s.value ? s.cls : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Field id="pitch" error={errors.pitch}
                         hint={`${form.pitch.trim().length}/600. The liner notes; about 300 characters reads best on the sleeve.`}>
                    <label htmlFor="pitch" className={label}>Liner notes</label>
                    <textarea id="pitch" rows={4} className={input} value={form.pitch}
                              onChange={(e) => set('pitch', e.target.value)} />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field id="stack" error={errors.stack} hint="The tracklist: the stack, comma separated, four at most.">
                    <label htmlFor="stack" className={label}>Tracks</label>
                    <input id="stack" className={input} placeholder="TypeScript, Workers, Monorepo"
                           value={form.stack} onChange={(e) => set('stack', e.target.value)} />
                  </Field>
                </div>
              </Group>

              {/* ---------------------------------------------------- player -- */}
              <Group title="Player" note="The buttons under the project once the record is playing.">
                <Field id="link" error={errors.link}>
                  <label htmlFor="link" className={label}>Deploy URL</label>
                  <input id="link" className={input} placeholder="https://…"
                         value={form.link} onChange={(e) => set('link', e.target.value)} />
                </Field>

                <Field id="github" error={errors.github}>
                  <label htmlFor="github" className={label}>Source URL</label>
                  <input id="github" className={input} placeholder="https://github.com/mehdiacho/…"
                         value={form.github} onChange={(e) => set('github', e.target.value)} />
                </Field>

                <div className="md:col-span-2 border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className={label}>Main button</p>
                  <p className="text-xs text-zinc-600 -mt-0.5 mb-3">
                    A label plus where it goes, shown first. Leave the label empty for no button.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field id="actionText" error={errors.actionText}>
                      <label htmlFor="actionText" className={label}>Button text</label>
                      <input id="actionText" className={input} placeholder="Join the test"
                             value={form.actionText} onChange={(e) => set('actionText', e.target.value)} />
                    </Field>
                    <Field id="actionHref" error={errors.actionHref}>
                      <label htmlFor="actionHref" className={label}>Button link</label>
                      <input id="actionHref" className={input} disabled={form.actionVault}
                             placeholder="https://groups.google.com/…"
                             value={form.actionVault ? '' : form.actionHref}
                             onChange={(e) => set('actionHref', e.target.value)} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 mt-3 text-xs text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={form.actionVault} className="accent-cyan-500"
                           onChange={(e) => set('actionVault', e.target.checked)} />
                    Opens Secure Vault instead of a link
                  </label>
                </div>

                <label className="md:col-span-2 flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" checked={form.isPrivate} className="accent-cyan-500"
                         onChange={(e) => set('isPrivate', e.target.checked)} />
                  Private repo: show “source on request” instead of a source link
                </label>
              </Group>

              {/* ----------------------------------------------------- crate -- */}
              <Group title="Crate" note="Where the record is filed.">
                <div className="md:col-span-2">
                  <span className={label}>Group</span>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value} onClick={() => set('category', c.value)}
                        aria-pressed={form.category === c.value}
                        className={`border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          form.category === c.value
                            ? 'border-cyan-700 text-cyan-300'
                            : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Field id="order" error={errors.order} hint="Lower numbers sit nearer the front of the crate.">
                  <label htmlFor="order" className={label}>Order</label>
                  <input id="order" inputMode="numeric" className={input} value={form.order}
                         onChange={(e) => set('order', e.target.value)} />
                </Field>

                <label className="flex items-center gap-2 self-end pb-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" checked={form.draft} className="accent-cyan-500"
                         onChange={(e) => set('draft', e.target.checked)} />
                  Draft: keep it out of the crate
                </label>
              </Group>
            </div>

            <RecordPreview form={form} />
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
            <button
              onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-cyan-950/40 border border-cyan-800 text-cyan-300 px-4 py-2 font-mono text-[11px] uppercase hover:border-cyan-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Saving' : 'Save'}
            </button>
            <button onClick={() => setForm(null)}
                    className="font-mono text-[11px] uppercase text-zinc-500 hover:text-zinc-300">
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* list */}
      {loading ? (
        <div className="flex items-center gap-3 text-zinc-500 font-mono text-sm">
          <Loader2 className="animate-spin" size={16} /> Loading projects…
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-sm text-zinc-400">No projects in Firestore yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            The site is showing its built-in fallback list until you add one here.
          </p>
        </div>
      ) : (
        <ul className="border-t border-zinc-800">
          {rows.map(({ docId, data }) => {
            const meta = STATUS.find((s) => s.value === data.status) ?? STATUS[1];
            return (
              <li key={docId}
                  className="flex items-center gap-4 border-b border-zinc-800 py-3 hover:bg-zinc-900/60 transition-colors">
                <span className="font-mono text-xs text-zinc-600 w-10 shrink-0 tabular-nums">
                  {data.order ?? '—'}
                </span>
                {data.poster || data.image
                  ? <img src={data.poster || data.image} alt={`Cover art for ${data.title}`} loading="lazy" decoding="async"
                         className="h-12 w-12 object-cover border border-zinc-800 shrink-0" />
                  : <div className="h-12 w-12 border border-zinc-800 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-zinc-500">{data.id}</span>
                    <span className="font-mono text-sm text-zinc-100 truncate">{data.title}</span>
                    <span className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase ${meta.cls}`}>
                      {meta.label}
                    </span>
                    {data.draft && (
                      <span className="flex items-center gap-1 border border-zinc-700 px-1.5 py-0.5 font-mono text-[9px] uppercase text-zinc-500">
                        <EyeOff size={9} /> Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{data.pitch}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {data.github && (
                    <a href={data.github} target="_blank" rel="noopener noreferrer"
                       title="Source" className="p-2 text-zinc-600 hover:text-zinc-300">
                      <Github size={14} />
                    </a>
                  )}
                  {data.link && (
                    <a href={data.link} target="_blank" rel="noopener noreferrer"
                       title="Deploy" className="p-2 text-zinc-600 hover:text-zinc-300">
                      <Eye size={14} />
                    </a>
                  )}
                  <button onClick={() => edit(docId, data)}
                          className="border border-zinc-800 px-3 py-1.5 font-mono text-[10px] uppercase text-zinc-400 hover:text-cyan-400 hover:border-cyan-700 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => remove(docId, data.title)} title="Delete"
                          className="p-2 text-zinc-700 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 border border-cyan-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs text-cyan-300 shadow-lg">
          <Check size={13} /> {toast}
        </div>
      )}
    </Shell>
  );
}

function Group({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 md:grid-cols-2">
      <legend className="md:col-span-2 mb-4">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-500">{title}</span>
        <span className="block text-xs text-zinc-600 mt-0.5">{note}</span>
      </legend>
      {children}
    </fieldset>
  );
}

// Same colours as the category sleeves on the site (records.css).
const SLEEVE_COLOR: Record<ProjectCategory, string> = {
  ai: '#11508f',
  tools: '#e5231b',
  games: '#6b3fa0',
};

/**
 * A rough, live sketch of the record as the site will draw it, so a long
 * title or an over-full back shows up before saving rather than after.
 */
function RecordPreview({ form }: { form: FormState }) {
  const title = form.title.trim().replace(/_/g, ' ') || 'Untitled';
  const tracks = form.stack.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4);
  const art = form.poster.trim();
  const cover = form.image.trim();
  const color = SLEEVE_COLOR[form.category];
  const group = CATEGORIES.find((c) => c.value === form.category)?.label ?? '';
  const status = STATUS.find((s) => s.value === form.status)?.label ?? '';

  return (
    <aside className="lg:sticky lg:top-6 self-start" aria-label="Record preview">
      <p className={label}>Preview</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {/* front */}
        <div className="relative aspect-square overflow-hidden border border-zinc-700 text-white"
             style={{ background: color }}>
          {art ? (
            <>
              <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 font-mono text-[10px] uppercase truncate">
                {title}
              </span>
            </>
          ) : (
            <div className="flex h-full flex-col justify-between p-3">
              <p className="flex justify-between font-mono text-[9px] uppercase opacity-80">
                <span>{form.id || 'P--'}</span><span>{group}</span>
              </p>
              <div className="aspect-[800/264] overflow-hidden border border-black/30 bg-white">
                {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
              </div>
              <p className="font-black text-xl leading-none break-words">{title}</p>
            </div>
          )}
        </div>
        {/* back */}
        <div className="aspect-square overflow-hidden border border-zinc-700 bg-[#f4efe4] p-3 text-zinc-900">
          <p className="font-mono text-[9px] uppercase text-zinc-500">{form.id || 'P--'} / {status}</p>
          <p className="mt-1 font-black text-sm leading-tight truncate">{title}</p>
          <p className="mt-1.5 text-[11px] leading-snug line-clamp-6">
            {form.pitch.trim() || 'Liner notes go here.'}
          </p>
          {tracks.length > 0 && (
            <ol className="mt-2 space-y-0.5 font-mono text-[9px] uppercase">
              {tracks.map((t, i) => <li key={t}><span className="text-zinc-500">A{i + 1}</span> {t}</li>)}
            </ol>
          )}
        </div>
      </div>
      <p className="mt-2 text-[11px] text-zinc-600">A sketch. The site has the final say on fit.</p>
    </aside>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}
