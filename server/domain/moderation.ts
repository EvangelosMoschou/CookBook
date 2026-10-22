/**
 * Server-side content policy.
 *
 * The client mirrors this list for immediate feedback, but the authoritative
 * check happens here so the rule cannot be bypassed by calling the API directly.
 *
 * Matching is word-bounded: "shellfish" does not trip the "hell" rule.
 */

export const BANNED_WORDS = ['damn', 'hell', 'crap', 'stupid', 'idiot', 'hate'] as const;

const BANNED_PATTERN = new RegExp(`\\b(${BANNED_WORDS.join('|')})\\b`, 'i');

export function findViolation(text: string): string | null {
  const match = text.match(BANNED_PATTERN);
  return match ? match[1].toLowerCase() : null;
}

export function hasViolation(text: string): boolean {
  return BANNED_PATTERN.test(text);
}
