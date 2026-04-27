import { WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of, Subscription, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { GroceryItemDraft, GroceryList } from '@app/core/models/grocery.models';
import { GroceryApiService } from '@app/core/services/grocery-api.service';
import { parseListIdFromParam } from '@app/core/utils/parse-list-id';

import { ListsResult } from './lists.events';

/** Signals + publish hook used by list-detail HTTP handlers (keeps {@link ListsFacade} under max-lines). */
export type ListsDetailEffectSlice = {
  publish: (r: ListsResult) => void;
  detailLoadError: WritableSignal<boolean>;
  detailList: WritableSignal<GroceryList | null>;
  detailAddItemError: WritableSignal<boolean>;
  detailItemSaveHttpErrorId: WritableSignal<number | null>;
  detailItemDeleteHttpErrorId: WritableSignal<number | null>;
  detailItemBoughtHttpErrorId: WritableSignal<number | null>;
};

export function subscribeListDetailRoute(
  route: ActivatedRoute,
  api: GroceryApiService,
  s: ListsDetailEffectSlice,
): Subscription {
  return route.paramMap
    .pipe(
      map((pm) => parseListIdFromParam(pm.get('listId'))),
      distinctUntilChanged(),
      switchMap((listId) =>
        listId === null
          ? throwError(() => new Error('invalid list id'))
          : forkJoin({
              list: api.getList(listId),
              items: api.getItems(listId),
            }).pipe(catchError(() => of(null))),
      ),
    )
    .subscribe({
      next(res) {
        if (!res) {
          s.detailLoadError.set(true);
          s.detailList.set(null);
          s.publish({ type: 'LIST_DETAIL_LOAD_FAILED' });
          return;
        }
        s.detailLoadError.set(false);
        s.detailList.set(res.list);
        s.publish({ type: 'LIST_DETAIL_LOADED', list: res.list, items: res.items });
      },
      error() {
        s.detailLoadError.set(true);
        s.detailList.set(null);
        s.publish({ type: 'LIST_DETAIL_LOAD_FAILED' });
      },
    });
}

export function detailCreateItem(
  api: GroceryApiService,
  draft: GroceryItemDraft,
  s: ListsDetailEffectSlice,
): void {
  s.detailAddItemError.set(false);
  api.createItem(draft).subscribe({
    next(item) {
      s.publish({ type: 'LIST_DETAIL_ITEM_CREATED', item });
    },
    error() {
      s.detailAddItemError.set(true);
      s.publish({ type: 'LIST_DETAIL_ADD_ITEM_FAILED' });
    },
  });
}

export function detailUpdateItemRow(
  api: GroceryApiService,
  id: number,
  body: { title: string; amount: number },
  correlationId: string | undefined,
  s: ListsDetailEffectSlice,
): void {
  s.detailItemSaveHttpErrorId.set(null);
  api.updateItem(id, body).subscribe({
    next(item) {
      s.detailItemSaveHttpErrorId.set(null);
      s.publish({ type: 'LIST_DETAIL_ITEM_SAVED', id, item, correlationId });
    },
    error() {
      s.detailItemSaveHttpErrorId.set(id);
      s.publish({ type: 'LIST_DETAIL_ITEM_SAVE_FAILED', id, correlationId });
    },
  });
}

export function detailUpdateBought(
  api: GroceryApiService,
  id: number,
  bought: boolean,
  s: ListsDetailEffectSlice,
): void {
  s.detailItemBoughtHttpErrorId.set(null);
  api.updateItem(id, { bought }).subscribe({
    next(item) {
      s.detailItemBoughtHttpErrorId.set(null);
      s.publish({ type: 'LIST_DETAIL_ITEM_BOUGHT_UPDATED', id, item });
    },
    error() {
      s.detailItemBoughtHttpErrorId.set(id);
      s.publish({ type: 'LIST_DETAIL_ITEM_BOUGHT_FAILED', id });
    },
  });
}

export function detailDeleteItem(
  api: GroceryApiService,
  id: number,
  s: ListsDetailEffectSlice,
): void {
  s.detailItemDeleteHttpErrorId.set(null);
  api.deleteItem(id).subscribe({
    next() {
      s.detailItemDeleteHttpErrorId.set(null);
      s.publish({ type: 'LIST_DETAIL_ITEM_DELETED', id });
    },
    error() {
      s.detailItemDeleteHttpErrorId.set(id);
      s.publish({ type: 'LIST_DETAIL_ITEM_DELETE_FAILED', id });
    },
  });
}
