/** Correlates a {@link ListsIntent} with its {@link ListsResult} when multiple requests overlap. */
export function newListsCorrelationId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  );
}
