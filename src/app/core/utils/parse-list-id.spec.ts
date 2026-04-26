import { parseListIdFromParam } from './parse-list-id';

describe('parseListIdFromParam', () => {
  it('returns null for null, empty, non-numeric, zero and negative', () => {
    expect(parseListIdFromParam(null)).toBeNull();
    expect(parseListIdFromParam('')).toBeNull();
    expect(parseListIdFromParam('abc')).toBeNull();
    expect(parseListIdFromParam('0')).toBeNull();
    expect(parseListIdFromParam('-3')).toBeNull();
  });

  it('returns truncated positive integer', () => {
    expect(parseListIdFromParam('42')).toBe(42);
    expect(parseListIdFromParam('7.9')).toBe(7);
  });
});
