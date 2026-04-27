/** Normalized path without query string. */
export function listsPathOnly(url: string): string {
  return url.split('?')[0];
}

/** `/lists/:listId/edit` */
export function isListEditUrl(path: string): boolean {
  return /\/lists\/[^/]+\/edit$/.test(listsPathOnly(path));
}

/** `/lists/:numericId` (not `/new`, not `/edit`). */
export function isListDetailUrl(path: string): boolean {
  return /^\/lists\/\d+\/?$/.test(listsPathOnly(path));
}
