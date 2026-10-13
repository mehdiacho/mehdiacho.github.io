/** ISO weeks in UTC. A week runs Monday 00:00 to Sunday 23:59:59 UTC and is written 2026-W42. */
const DAY = 86_400_000;

export function weekOf(now = new Date()): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // The Thursday of a week decides which year the week belongs to.
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const week = Math.ceil(((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Monday 00:00 UTC of the week, in milliseconds. */
export function weekStart(week: string): number {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) throw new Error('Invalid week.');
  const jan4 = Date.UTC(Number(match[1]), 0, 4);
  const firstMonday = jan4 - ((new Date(jan4).getUTCDay() || 7) - 1) * DAY;
  return firstMonday + (Number(match[2]) - 1) * 7 * DAY;
}

export const weekEnd = (week: string) => weekStart(week) + 7 * DAY;

export function validWeek(week: unknown): week is string {
  if (typeof week !== 'string' || !/^\d{4}-W\d{2}$/.test(week)) return false;
  return weekOf(new Date(weekStart(week))) === week;
}

export const previousWeek = (week: string) => weekOf(new Date(weekStart(week) - 1));

/** "Mon 12 Oct – Sun 18 Oct" for display. */
export function weekRange(week: string): string {
  const format = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${format(weekStart(week))} – ${format(weekEnd(week) - 1)}`;
}
