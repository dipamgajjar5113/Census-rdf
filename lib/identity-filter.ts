/**
 * Drop free text that looks identifying. Returns the cleaned goal or null.
 * Rejects emails, phone numbers, long digit runs, "my name is…", "@handle".
 */
const PATTERNS: RegExp[] = [
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // email
  /(?:\+?\d[\s-]?){7,}/, // phone / long digit runs
  /\b\d{5,}\b/, // 5+ consecutive digits (student numbers)
  /\bmy name is\b/i,
  /\bi am [A-Z][a-z]+\b/,
  /(^|\s)@\w{2,}/, // @handle
];

export function looksIdentifying(text: string): boolean {
  return PATTERNS.some((p) => p.test(text));
}

export function cleanGoal(raw: string | null, maxLength = 140): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().slice(0, maxLength);
  if (trimmed.length === 0) return null;
  if (looksIdentifying(trimmed)) return null;
  return trimmed;
}
