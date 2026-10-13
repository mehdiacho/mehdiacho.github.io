export function normalizeName(input: unknown): string {
  if (typeof input !== 'string') throw new Error('Use a callsign of 3–12 letters or numbers.');
  const name = input.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,12}$/.test(name)) throw new Error('Use a callsign of 3–12 letters or numbers.');
  return name;
}

/**
 * A word filter for the public board. Short on purpose: it catches the
 * obvious and the obvious spelled with digits, and reserves the generated
 * PLAYER- aliases and the site owner's name so nobody can pass as either.
 * Anything it misses can be removed from the database by hand.
 */
const BLOCKED = ['FUCK', 'SHIT', 'CUNT', 'BITCH', 'NIGG', 'FAG', 'RAPE', 'NAZI', 'HITLER', 'WHORE', 'SLUT', 'DICK', 'COCK', 'PUSSY', 'PENIS', 'VAGIN', 'ASSHOLE', 'KKK', 'PORN', 'TWAT', 'WANK', 'RETARD'];
const RESERVED = ['PLAYER', 'ROUTE', 'ADMIN', 'MEHDI', 'ACHO'];
const LEET: Record<string, string> = { '0': 'O', '1': 'I', '3': 'E', '4': 'A', '5': 'S', '7': 'T', '8': 'B' };

/** A callsign that may appear publicly, or an error saying why not. */
export function publicCallsign(input: unknown): string {
  const name = normalizeName(input);
  const plain = name.replace(/[0-9]/g, digit => LEET[digit] ?? digit);
  if (BLOCKED.some(word => plain.includes(word)) || RESERVED.some(word => plain.startsWith(word)))
    throw new Error('Pick a different callsign for the public board.');
  return name;
}

/** Standard competition ranking on scores where higher wins: equal scores share a place, so 1, 1, 3. */
export function sharedRanks(scores: number[]): number[] {
  return scores.map(score => 1 + scores.filter(other => other > score).length);
}
