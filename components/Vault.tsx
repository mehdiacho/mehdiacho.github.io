import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Lock, Upload, Download, Copy, Check, KeyRound, ShieldCheck, Clock, Eye,
  X, FileText, Trash2, Send, Inbox, Link2, AlertTriangle, Loader2, Plus,
} from 'lucide-react';
import {
  generateToken, formatCode, normalizeCode, buildShareLink, deriveId,
  encryptManifest, decryptManifest, fileToBase64, base64ToBlob, base64ToText,
  VaultFile, VaultManifest,
} from '../lib/vault-crypto';
import { createSecret, openSecret } from '../lib/vault-api';
import { track } from '../lib/firebase';

type Tab = 'send' | 'receive';

interface VaultProps {
  open: boolean;
  initialTab?: Tab;
  initialToken?: string;
  onClose: () => void;
}

const TTL_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
];

// Client-side soft cap on raw payload; the Worker enforces the real limit.
const MAX_RAW_BYTES = 200_000;

const ERRORS: Record<string, string> = {
  not_found_or_expired: 'This key is invalid, already used up, or has expired.',
  exhausted: 'This secret hit its access limit and has been destroyed.',
  too_large: 'That payload is too large (keep it under ~200 KB).',
  network_error: 'Could not reach the vault server. Check your connection and try again.',
  id_exists: 'Key collision — please generate again.',
  decrypt: 'Wrong key, or the data is corrupted.',
};
const friendly = (code: string) => ERRORS[code] ?? 'Something went wrong. Please try again.';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// Heuristic: does this base64 payload decode to mostly-printable text?
function isProbablyText(b64: string): boolean {
  try {
    const bin = atob(b64.slice(0, 4096));
    let control = 0;
    for (let i = 0; i < bin.length; i++) {
      const c = bin.charCodeAt(i);
      if (c === 9 || c === 10 || c === 13) continue;
      if (c < 32 || c === 127) control++;
    }
    return bin.length === 0 || control / bin.length < 0.1;
  } catch {
    return false;
  }
}

// ---- small UI atoms --------------------------------------------------------

const CopyButton: React.FC<{ value: string; label?: string; className?: string }> = ({ value, label = 'COPY', className = '' }) => {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] uppercase border transition-colors ${
        done ? 'border-green-700 text-green-400' : 'border-zinc-700 text-zinc-400 hover:border-cyan-500/60 hover:text-cyan-400'
      } ${className}`}
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
      {done ? 'COPIED' : label}
    </button>
  );
};

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ===========================================================================

const Vault: React.FC<VaultProps> = ({ open, initialTab = 'send', initialToken, onClose }) => {
  const [tab, setTab] = useState<Tab>(initialTab);

  // ---- SEND state ----
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [text, setText] = useState('');
  const [maxViews, setMaxViews] = useState(1);
  const [ttlHours, setTtlHours] = useState(24);
  const [creating, setCreating] = useState(false);
  const [sendError, setSendError] = useState('');
  const [result, setResult] = useState<{ code: string; link: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // ---- RECEIVE state ----
  const [codeInput, setCodeInput] = useState('');
  const [opening, setOpening] = useState(false);
  const [recvError, setRecvError] = useState('');
  const [manifest, setManifest] = useState<VaultManifest | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  // When opened via a share link, jump straight to RECEIVE and prefill the code.
  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    if (initialToken) {
      setTab('receive');
      setCodeInput(formatCode(normalizeCode(initialToken)));
    }
  }, [open, initialTab, initialToken]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const totalRaw = useMemo(
    () => files.reduce((s, f) => s + f.size, 0) + new Blob([text]).size,
    [files, text],
  );

  const addFiles = async (list: FileList | File[]) => {
    setSendError('');
    const incoming = Array.from(list);
    const read: VaultFile[] = [];
    for (const file of incoming) {
      const b64 = await fileToBase64(file);
      read.push({ name: file.name, b64, size: file.size });
    }
    setFiles((prev) => [...prev, ...read]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const resetSend = () => {
    setFiles([]);
    setText('');
    setMaxViews(1);
    setTtlHours(24);
    setResult(null);
    setSendError('');
  };

  const handleGenerate = async () => {
    setSendError('');
    if (files.length === 0 && text.trim() === '') {
      setSendError('Add at least one file or some text to share.');
      return;
    }
    if (totalRaw > MAX_RAW_BYTES) {
      setSendError(`Payload is ${formatBytes(totalRaw)} — keep it under ${formatBytes(MAX_RAW_BYTES)}.`);
      return;
    }
    setCreating(true);
    try {
      const manifestToSend: VaultManifest = {
        files,
        text: text.trim() ? text : undefined,
      };
      const token = generateToken();
      const id = await deriveId(token);
      const { ct, iv } = await encryptManifest(token, manifestToSend);
      const contentType: 'files' | 'text' | 'mixed' =
        files.length && manifestToSend.text ? 'mixed' : files.length ? 'files' : 'text';
      await createSecret({ id, ct, iv, maxViews, ttlHours, contentType, size: totalRaw });
      setResult({ code: formatCode(token), link: buildShareLink(token) });
      track('vault_create', { contentType, maxViews, ttlHours });
    } catch (e) {
      setSendError(friendly(e instanceof Error ? e.message : ''));
    } finally {
      setCreating(false);
    }
  };

  const handleUnlock = async () => {
    setRecvError('');
    setManifest(null);
    setRemaining(null);
    const token = normalizeCode(codeInput);
    if (!token) {
      setRecvError('Enter the access key or paste the share link.');
      return;
    }
    setOpening(true);
    try {
      const id = await deriveId(token);
      const res = await openSecret(id);
      let decoded: VaultManifest;
      try {
        decoded = await decryptManifest(token, res.ct, res.iv);
      } catch {
        throw new Error('decrypt');
      }
      setManifest(decoded);
      setRemaining(res.remaining);
      track('vault_open', { contentType: res.contentType });
    } catch (e) {
      setRecvError(friendly(e instanceof Error ? e.message : ''));
    } finally {
      setOpening(false);
    }
  };

  const ttlLabel = TTL_OPTIONS.find((t) => t.hours === ttlHours)?.label ?? `${ttlHours}h`;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 font-mono my-4"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* corner accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-500" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-500" />

          {/* header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-3">
            <div className="flex items-center gap-2 text-cyan-500">
              <Lock size={15} />
              <span className="text-xs font-bold tracking-widest">SECURE_VAULT</span>
              <span className="hidden sm:inline text-[10px] text-zinc-600">// end-to-end encrypted</span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors" title="Close (Esc)">
              <X size={18} />
            </button>
          </div>

          {/* tabs */}
          <div className="grid grid-cols-2 border-b border-zinc-800">
            {([
              { id: 'send' as Tab, label: 'SEND', icon: <Send size={14} /> },
              { id: 'receive' as Tab, label: 'RECEIVE', icon: <Inbox size={14} /> },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors ${
                  tab === t.id
                    ? 'text-cyan-400 bg-zinc-900 border-b-2 border-cyan-500'
                    : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {tab === 'send' ? (
              result ? (
                /* ---- SEND: result ---- */
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <ShieldCheck size={18} />
                    <span>Encrypted &amp; stored. Share these with your recipient.</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                      <KeyRound size={12} /> Access key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-cyan-300 text-sm break-all select-all">
                        {result.code}
                      </code>
                      <CopyButton value={result.code} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                      <Link2 size={12} /> Share link
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-zinc-300 text-xs break-all select-all">
                        {result.link}
                      </code>
                      <CopyButton value={result.link} />
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 leading-relaxed border-l-2 border-zinc-800 pl-3 space-y-1">
                    <p className="flex items-center gap-1.5"><Eye size={12} /> Opens allowed: <span className="text-zinc-300">{maxViews}</span></p>
                    <p className="flex items-center gap-1.5"><Clock size={12} /> Expires after: <span className="text-zinc-300">{ttlLabel}</span></p>
                    <p className="flex items-center gap-1.5 text-amber-500/90"><AlertTriangle size={12} /> Anyone with the key can read it. For best safety, send the key and link over <span className="text-amber-300">separate channels</span>.</p>
                  </div>

                  <button
                    onClick={resetSend}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-950 border border-zinc-800 text-xs uppercase tracking-widest text-zinc-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                  >
                    <Plus size={14} /> Share something else
                  </button>
                </div>
              ) : (
                /* ---- SEND: compose ---- */
                <div className="space-y-5">
                  {/* dropzone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-2 border border-dashed py-7 cursor-pointer transition-colors ${
                      dragging ? 'border-cyan-500 bg-cyan-950/10' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-950'
                    }`}
                  >
                    <Upload size={22} className="text-zinc-500" />
                    <p className="text-xs text-zinc-400">Drop files here or <span className="text-cyan-400">browse</span></p>
                    <p className="text-[10px] text-zinc-600">.env, keys, certs — anything. Encrypted in your browser.</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      onChange={(e) => e.target.files && addFiles(e.target.files)}
                    />
                  </div>

                  {/* file list */}
                  {files.length > 0 && (
                    <div className="space-y-1.5">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2">
                          <FileText size={14} className="text-cyan-500 shrink-0" />
                          <span className="flex-1 text-xs text-zinc-300 truncate">{f.name}</span>
                          <span className="text-[10px] text-zinc-600">{formatBytes(f.size)}</span>
                          <button onClick={() => removeFile(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* text */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-zinc-500">…or paste text</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      placeholder={'# .env.local\nDATABASE_URL=...\nAPI_KEY=...'}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-cyan-500/60 outline-none resize-y"
                    />
                  </div>

                  {/* limits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <Eye size={12} /> Max opens
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={maxViews}
                        onChange={(e) => setMaxViews(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-cyan-500/60 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <Clock size={12} /> Expires in
                      </label>
                      <select
                        value={ttlHours}
                        onChange={(e) => setTtlHours(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-cyan-500/60 outline-none"
                      >
                        {TTL_OPTIONS.map((t) => (
                          <option key={t.hours} value={t.hours}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(files.length > 0 || text) && (
                    <p className="text-[10px] text-zinc-600 text-right">
                      payload: {formatBytes(totalRaw)} / {formatBytes(MAX_RAW_BYTES)}
                    </p>
                  )}

                  {sendError && (
                    <div className="flex items-center gap-2 text-xs text-red-400 border border-red-900/50 bg-red-950/20 px-3 py-2">
                      <AlertTriangle size={14} /> {sendError}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={creating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-950/40 border border-cyan-700/60 text-sm uppercase tracking-widest text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                    {creating ? 'Encrypting…' : 'Generate access key'}
                  </button>
                </div>
              )
            ) : (
              /* ---- RECEIVE ---- */
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <KeyRound size={12} /> Access key or share link
                  </label>
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="XXXX-XXXX-XXXX-… or paste the link"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-cyan-300 placeholder:text-zinc-700 focus:border-cyan-500/60 outline-none"
                  />
                  <p className="text-[10px] text-zinc-600 flex items-center gap-1.5">
                    <AlertTriangle size={11} /> Unlocking uses one of the allowed opens.
                  </p>
                </div>

                {recvError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 border border-red-900/50 bg-red-950/20 px-3 py-2">
                    <AlertTriangle size={14} /> {recvError}
                  </div>
                )}

                {!manifest && (
                  <button
                    onClick={handleUnlock}
                    disabled={opening}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-950/40 border border-cyan-700/60 text-sm uppercase tracking-widest text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {opening ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    {opening ? 'Decrypting…' : 'Unlock'}
                  </button>
                )}

                {manifest && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-green-400"><ShieldCheck size={15} /> Decrypted</span>
                      <span className="text-zinc-500">
                        {remaining === 0 ? (
                          <span className="text-amber-400">final access — now destroyed</span>
                        ) : (
                          <>opens left: <span className="text-zinc-300">{remaining}</span></>
                        )}
                      </span>
                    </div>

                    {manifest.files.map((f, i) => {
                      const textable = isProbablyText(f.b64);
                      return (
                        <div key={i} className="bg-zinc-950 border border-zinc-800">
                          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
                            <FileText size={14} className="text-cyan-500 shrink-0" />
                            <span className="flex-1 text-xs text-zinc-300 truncate">{f.name}</span>
                            <span className="text-[10px] text-zinc-600">{formatBytes(f.size)}</span>
                            {textable && <CopyButton value={base64ToText(f.b64)} />}
                            <button
                              onClick={() => downloadBlob(f.name, base64ToBlob(f.b64))}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] uppercase border border-zinc-700 text-zinc-400 hover:border-cyan-500/60 hover:text-cyan-400 transition-colors"
                            >
                              <Download size={13} /> SAVE
                            </button>
                          </div>
                          {textable && (
                            <pre className="px-3 py-2 text-[11px] text-zinc-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto custom-scrollbar">
                              {base64ToText(f.b64)}
                            </pre>
                          )}
                        </div>
                      );
                    })}

                    {manifest.text && (
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
                          <FileText size={14} className="text-cyan-500" />
                          <span className="flex-1 text-xs text-zinc-300">pasted text</span>
                          <CopyButton value={manifest.text} />
                          <button
                            onClick={() => downloadBlob('secret.txt', base64ToBlob(btoa(unescape(encodeURIComponent(manifest.text!))), 'text/plain'))}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] uppercase border border-zinc-700 text-zinc-400 hover:border-cyan-500/60 hover:text-cyan-400 transition-colors"
                          >
                            <Download size={13} /> SAVE
                          </button>
                        </div>
                        <pre className="px-3 py-2 text-[11px] text-zinc-400 whitespace-pre-wrap break-all max-h-48 overflow-y-auto custom-scrollbar">
                          {manifest.text}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Vault;
