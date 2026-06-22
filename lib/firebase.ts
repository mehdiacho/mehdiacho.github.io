/**
 * Firebase initialization + Analytics.
 *
 * Config is read from Vite env vars (VITE_FIREBASE_*) so nothing secret is
 * committed. Firebase web config values are technically public, but keeping
 * them in env keeps the repo clean and lets the build run without them.
 *
 * The Firebase SDK is loaded via dynamic import() so it lands in its own async
 * chunk and never blocks first paint. If config is missing (e.g. local dev with
 * no .env), this module no-ops instead of throwing, so the site always renders.
 *
 * Setup: copy .env.example -> .env and fill in the values from your Firebase
 * project settings (Project settings -> General -> Your apps -> SDK setup).
 */
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
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
