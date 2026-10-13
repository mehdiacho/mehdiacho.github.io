export const ANALYTICS_CHOICE_KEY = 'portfolio.analytics.v1';
let memoryChoice: boolean | undefined;

export function analyticsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  if (memoryChoice !== undefined) return memoryChoice;
  try { return localStorage.getItem(ANALYTICS_CHOICE_KEY) === 'enabled'; }
  catch { return false; }
}

export function saveAnalyticsChoice(enabled: boolean) {
  memoryChoice = enabled;
  try { localStorage.setItem(ANALYTICS_CHOICE_KEY, enabled ? 'enabled' : 'disabled'); } catch { /* This tab still honours the choice. */ }
}

export function clearAnalyticsCookies() {
  const names = document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => /^_ga(?:_|$)|^_gid$|^_gat/.test(n));
  const parts = location.hostname.split('.');
  const domains = ['', ...parts.map((_, i) => parts.slice(i).join('.')).filter(d => d.includes('.'))];
  for (const name of names) for (const domain of domains) {
    document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}; SameSite=Lax`;
  }
}
