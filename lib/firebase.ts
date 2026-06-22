/**
 * Firebase initialization + Analytics.
 *
 * The Firebase web config below is public by design (Google ships it in client
 * code) — security comes from Firebase rules / App Check, not from hiding these
 * values. They're set as fallback defaults so Analytics works on any host
 * (incl. the current GitHub Pages deploy) without extra setup. The matching
 * VITE_FIREBASE_* env vars still override them if present (see .env.example).
 *
 * The Firebase SDK is loaded via dynamic import() so it lands in its own async
 * chunk and never blocks first paint, and init is wrapped so analytics can
 * never break the page.
 */
import type { Analytics } from 'firebase/analytics';

// Project: mehdi-00. Public web config — safe to commit.
const DEFAULT_CONFIG = {
  apiKey: 'AIzaSyBABhCSUEqUlX998QaAYICFsIP9eUKkcBc',
  authDomain: 'mehdi-00.firebaseapp.com',
  projectId: 'mehdi-00',
  storageBucket: 'mehdi-00.firebasestorage.app',
  messagingSenderId: '857525867185',
  appId: '1:857525867185:web:562abddbe8ea24b9db8890',
  measurementId: 'G-N70BVPZ6JP',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? DEFAULT_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? DEFAULT_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? DEFAULT_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? DEFAULT_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? DEFAULT_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? DEFAULT_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? DEFAULT_CONFIG.measurementId,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let analytics: Analytics | null = null;
let initStarted = false;

/**
 * Initialize Firebase + Analytics. Safe to call once on mount.
 * No-ops when unconfigured or analytics is unsupported (e.g. unsupported
 * browser). Loads the SDK lazily so it never blocks first paint.
 */
export async function initAnalytics(): Promise<void> {
  if (!isConfigured || initStarted) return;
  initStarted = true;
  try {
    const [{ initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import('firebase/app'),
      import('firebase/analytics'),
    ]);
    if (await isSupported()) {
      analytics = getAnalytics(initializeApp(firebaseConfig));
    }
  } catch (err) {
    // Never let analytics break the page.
    console.warn('[analytics] init skipped:', err);
  }
}

/** Fire a custom analytics event if analytics is active; no-op otherwise. */
export async function track(event: string, params?: Record<string, unknown>): Promise<void> {
  if (!analytics) return;
  try {
    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, event, params);
  } catch {
    /* swallow */
  }
}

export const analyticsConfigured = isConfigured;
