/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  // SECURE_VAULT backend (Cloudflare Worker). Optional — a public default is
  // baked into lib/vault-api.ts, so this only overrides it when set.
  readonly VITE_VAULT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
