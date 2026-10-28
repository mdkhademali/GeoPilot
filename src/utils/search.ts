export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** All query tokens must appear in the haystack (AND search). */
export function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = normalize(query).split(/\s+/).filter(Boolean);
  if (!q.length) return true;
  const hay = normalize(fields.filter(Boolean).join(' '));
  return q.every((t) => hay.includes(t));
}

export function filterBy<T>(items: T[], query: string, pick: (t: T) => (string | undefined)[]): T[] {
  return query.trim() ? items.filter((i) => matches(query, ...pick(i))) : items;
}
