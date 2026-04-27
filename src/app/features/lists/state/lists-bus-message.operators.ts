import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ListsBusMessage } from './lists.events';

/** Keeps only bus messages whose `type` is in `types` (narrowed union). */
export function filterBusMessageByTypes<const T extends readonly ListsBusMessage['type'][]>(
  types: T,
): OperatorFunction<ListsBusMessage, Extract<ListsBusMessage, { type: T[number] }>> {
  const allowed = new Set<ListsBusMessage['type']>(types);
  return filter((m): m is Extract<ListsBusMessage, { type: T[number] }> => allowed.has(m.type));
}
