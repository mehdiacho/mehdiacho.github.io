import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut, type User,
} from 'firebase/auth';
import {
  collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  AlertCircle, Check, ExternalLink, Eye, EyeOff, Github, Loader2, LogOut,
  Plus, Save, Trash2, Upload, X,
} from 'lucide-react';

import { auth, db, googleProvider, OWNER_EMAIL, storage } from './firebase';
import {
  docToForm, emptyForm, formToDoc, validate,
  type FormState, type ProjectDoc, type ProjectStatus,
} from './model';

const COLLECTION = 'projects';
const SITE = 'https://mehdiacho.tech';

const STATUS: { value: ProjectStatus; label: string; cls: string }[] = [
  { value: 'live', label: 'LIVE', cls: 'border-green-800 text-green-400' },
  { value: 'wip', label: 'WIP', cls: 'border-amber-800 text-amber-400' },
  { value: 'concept', label: 'CONCEPT', cls: 'border-zinc-700 text-zinc-400' },
];

/* ------------------------------------------------------------------ atoms -- */

const label = 'block font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 mb-1.5';
const input =
  'w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 ' +
  'placeholder:text-zinc-700 focus:outline-none focus:border-cyan-600 transition-colors';

function Field({
  id, children, error, hint,
}: { id: string; children: React.ReactNode; error?: string; hint?: string }) {
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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isOwner = !!user && user.email === OWNER_EMAIL;

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); }), []);

  const flash = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 3200);
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
      // The card code (P07) is the document id, so a rename moves the document
      // rather than leaving a duplicate behind.
      const targetId = form.id.trim();
      const payload = { ...formToDoc(form), updatedAt: serverTimestamp() };
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

  async function upload(file: File) {
    if (!form) return;
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `covers/${Date.now()}-${safe}`;
      const snap = await uploadBytes(ref(storage, path), file, { contentType: file.type });
      const url = await getDownloadURL(snap.ref);
      setForm((f) => (f ? { ...f, image: url } : f));
      flash('Cover uploaded.');
    } catch (err) {
      flash(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

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

          <div className="p-5 grid gap-5 md:grid-cols-2">
            <Field id="id" error={errors.id} hint="Shown on the card and used as the document id.">
              <label htmlFor="id" className={label}>Card code</label>
              <input id="id" className={input} placeholder="P21" value={form.id}
                     onChange={(e) => set('id', e.target.value)} />
            </Field>

            <Field id="title" error={errors.title}>
              <label htmlFor="title" className={label}>Title</label>
              <input id="title" className={input} placeholder="MACHINE_STRIKE" value={form.title}
                     onChange={(e) => set('title', e.target.value)} />
            </Field>

            <div className="md:col-span-2">
              <Field id="pitch" error={errors.pitch}
                     hint={`${form.pitch.trim().length}/600 — the card clamps to three lines.`}>
                <label htmlFor="pitch" className={label}>About</label>
                <textarea id="pitch" rows={3} className={input} value={form.pitch}
                          onChange={(e) => set('pitch', e.target.value)} />
              </Field>
            </div>

            <Field id="stack" error={errors.stack} hint="Comma separated, four maximum.">
              <label htmlFor="stack" className={label}>Tags</label>
              <input id="stack" className={input} placeholder="TypeScript, Workers, Monorepo"
                     value={form.stack} onChange={(e) => set('stack', e.target.value)} />
            </Field>

            <Field id="order" error={errors.order} hint="Lower numbers appear first.">
              <label htmlFor="order" className={label}>Order</label>
              <input id="order" inputMode="numeric" className={input} value={form.order}
                     onChange={(e) => set('order', e.target.value)} />
            </Field>

            {/* media */}
            <div className="md:col-span-2">
              <Field id="image" error={errors.image}
                     hint="A generated cover under /covers/, or upload your own screenshot.">
                <label htmlFor="image" className={label}>Cover image</label>
                <div className="flex gap-2">
                  <input id="image" className={input} placeholder="/covers/machine-strike.svg"
                         value={form.image} onChange={(e) => set('image', e.target.value)} />
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                         onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  <button
                    onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 shrink-0 border border-zinc-800 px-3 font-mono text-[11px] uppercase text-zinc-400 hover:text-cyan-400 hover:border-cyan-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    Upload
                  </button>
                </div>
              </Field>
              {form.image && (
                <img src={form.image} alt={`Cover art preview for ${form.title || 'this project'}`}
                     className="mt-3 h-24 w-full max-w-md object-cover border border-zinc-800" />
              )}
            </div>

            {/* links */}
            <Field id="github" error={errors.github}>
              <label htmlFor="github" className={label}>Source URL</label>
              <input id="github" className={input} placeholder="https://github.com/mehdiacho/…"
                     value={form.github} onChange={(e) => set('github', e.target.value)} />
            </Field>

            <Field id="link" error={errors.link}>
              <label htmlFor="link" className={label}>Deploy URL</label>
              <input id="link" className={input} placeholder="https://…"
                     value={form.link} onChange={(e) => set('link', e.target.value)} />
            </Field>

            {/* the action object */}
            <div className="md:col-span-2 border border-zinc-800 bg-zinc-950/60 p-4">
              <p className={label}>Action button</p>
              <p className="text-xs text-zinc-600 -mt-0.5 mb-3">
                The card's main call to action — a label plus where it goes. Leave the label empty
                for no button.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <Field id="actionText" error={errors.actionText}>
                  <label htmlFor="actionText" className={label}>Button text</label>
                  <input id="actionText" className={input} placeholder="JOIN THE TEST"
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

            {/* state */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className={label + ' mb-0'}>Status</span>
                {STATUS.map((s) => (
                  <button
                    key={s.value} onClick={() => set('status', s.value)}
                    className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                      form.status === s.value ? s.cls : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={form.isPrivate} className="accent-cyan-500"
                       onChange={(e) => set('isPrivate', e.target.checked)} />
                Private repo — show “source on request”
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={form.draft} className="accent-cyan-500"
                       onChange={(e) => set('draft', e.target.checked)} />
                Draft — hide from the site
              </label>
            </div>
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
                {data.image
                  ? <img src={data.image} alt={`Cover art for ${data.title}`} className="h-10 w-20 object-cover border border-zinc-800 shrink-0" />
                  : <div className="h-10 w-20 border border-zinc-800 shrink-0" />}
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}
