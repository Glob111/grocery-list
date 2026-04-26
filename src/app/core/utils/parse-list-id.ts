/** Positive integer list id from a route param, or null if missing or invalid. */
export function parseListIdFromParam(raw: string | null): number | null {
  if (raw === null || raw === '') {
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Math.trunc(n);
}
