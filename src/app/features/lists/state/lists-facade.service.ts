import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { merge, of, Subject, Subscription, throwError } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  share,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import { GroceryList } from '@app/core/models/grocery.models';
import { GroceryApiService } from '@app/core/services/grocery-api.service';
import { parseListIdFromParam } from '@app/core/utils/parse-list-id';

import { ListsEventsBus } from './lists-events-bus.service';
import {
  ListsDetailEffectSlice,
  detailCreateItem as runDetailCreateItem,
  detailDeleteItem as runDetailDeleteItem,
  detailUpdateBought as runDetailUpdateBought,
  detailUpdateItemRow as runDetailUpdateItemRow,
  subscribeListDetailRoute,
} from './lists-facade-detail.effects';
import { isListDetailUrl, isListEditUrl, listsPathOnly } from './lists-route-matchers';
import { isListsIntent, ListsIntent, ListsResult } from './lists.events';

/** Lists feature state; handles {@link ListsIntent}, emits {@link ListsResult} on the same bus. */
@Injectable({ providedIn: 'root' })
export class ListsFacade {
  readonly catalog = signal<GroceryList[]>([]);
  readonly catalogError = signal(false);

  readonly listEdit = signal<GroceryList | null>(null);
  readonly listEditSubmitting = signal(false);
  readonly listEditDeleting = signal(false);
  readonly listEditSaveAttempted = signal(false);

  readonly detailList = signal<GroceryList | null>(null);
  readonly detailLoadError = signal(false);
  readonly detailAddItemError = signal(false);
  readonly detailItemSaveHttpErrorId = signal<number | null>(null);
  readonly detailItemDeleteHttpErrorId = signal<number | null>(null);
  readonly detailItemBoughtHttpErrorId = signal<number | null>(null);

  private readonly api = inject(GroceryApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bus = inject(ListsEventsBus);

  private readonly navigationEnd$ = this.router.events.pipe(
    filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd),
    share(),
  );

  private listEditHttpAbort$ = new Subject<void>();

  private catalogRefreshSub?: Subscription;
  private listEditRouteSub?: Subscription;
  private detailRouteSub?: Subscription;

  private readonly detailEffects: ListsDetailEffectSlice = {
    publish: (r) => {
      this.publish(r);
    },
    detailLoadError: this.detailLoadError,
    detailList: this.detailList,
    detailAddItemError: this.detailAddItemError,
    detailItemSaveHttpErrorId: this.detailItemSaveHttpErrorId,
    detailItemDeleteHttpErrorId: this.detailItemDeleteHttpErrorId,
    detailItemBoughtHttpErrorId: this.detailItemBoughtHttpErrorId,
  };

  constructor() {
    this.bus.events$
      .pipe(
        filter((m): m is ListsIntent => isListsIntent(m)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.dispatch(e);
      });
    this.navigationEnd$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.releaseRouteBindingsIfUrlLeft();
    });
  }
  private abortListEditHttp(): void {
    this.listEditHttpAbort$.next();
    this.listEditHttpAbort$.complete();
    this.listEditHttpAbort$ = new Subject<void>();
  }

  private publish(r: ListsResult): void {
    this.bus.emit(r);
  }

  private releaseRouteBindingsIfUrlLeft(): void {
    const path = listsPathOnly(this.router.url);
    if (!isListEditUrl(path)) {
      this.abortListEditHttp();
      this.listEditRouteSub?.unsubscribe();
      this.listEditRouteSub = undefined;
    }
    if (!isListDetailUrl(path)) {
      this.detailRouteSub?.unsubscribe();
      this.detailRouteSub = undefined;
    }
  }

  private dispatch(e: ListsIntent): void {
    switch (e.type) {
      case 'CATALOG_START_AUTO_REFRESH':
        this.startCatalogAutoRefresh();
        break;
      case 'REDIRECT_DEFAULT_LIST':
        this.redirectToDefaultList();
        break;
      case 'LIST_NEW_SUBMIT':
        this.onListNewSubmit(e);
        break;
      case 'LIST_EDIT_BIND':
        this.bindListEdit(e.route, e.form);
        break;
      case 'LIST_EDIT_SAVE':
        this.applyListEditSave(e);
        break;
      case 'LIST_EDIT_DELETE':
        this.listEditDelete(e);
        break;
      case 'LIST_DETAIL_BIND':
        this.bindListDetail(e.route);
        break;
      case 'LIST_DETAIL_ADD_ITEM':
        runDetailCreateItem(this.api, e.draft, this.detailEffects);
        break;
      case 'LIST_DETAIL_SAVE_ITEM':
        runDetailUpdateItemRow(this.api, e.id, e.body, e.correlationId, this.detailEffects);
        break;
      case 'LIST_DETAIL_BOUGHT':
        runDetailUpdateBought(this.api, e.id, e.bought, this.detailEffects);
        break;
      case 'LIST_DETAIL_DELETE_ITEM':
        runDetailDeleteItem(this.api, e.id, this.detailEffects);
        break;
      default: {
        const exhaustive: never = e;
        void exhaustive;
      }
    }
  }

  private onListNewSubmit(e: Extract<ListsIntent, { type: 'LIST_NEW_SUBMIT' }>): void {
    const { name, correlationId } = e;
    this.api.createList(name).subscribe({
      next: (list) => {
        void this.router.navigate(['/lists', list.id], { replaceUrl: true });
        this.publish({ type: 'LIST_NEW_SUCCEEDED', list, correlationId });
      },
      error: () => {
        this.publish({ type: 'LIST_NEW_FAILED', correlationId });
      },
    });
  }

  private startCatalogAutoRefresh(): void {
    if (this.catalogRefreshSub) {
      return;
    }
    this.catalogRefreshSub = merge(of(null), this.navigationEnd$)
      .pipe(
        switchMap(() =>
          this.api.getLists().pipe(
            map((lists) => ({ ok: true as const, lists })),
            catchError(() => of({ ok: false as const })),
          ),
        ),
      )
      .subscribe((r) => {
        if (r.ok) {
          this.catalog.set(r.lists);
          this.catalogError.set(false);
        } else {
          this.catalogError.set(true);
        }
      });
  }

  private redirectToDefaultList(): void {
    this.api.getLists().subscribe({
      next: (lists) => {
        if (lists.length === 0) {
          void this.router.navigate(['/lists', 'new'], { replaceUrl: true });
        } else {
          void this.router.navigate(['/lists', lists[0].id], { replaceUrl: true });
        }
      },
      error: () => {
        void this.router.navigate(['/lists', 'new'], { replaceUrl: true });
      },
    });
  }

  private bindListEdit(route: ActivatedRoute, form: FormGroup): void {
    this.detailRouteSub?.unsubscribe();
    this.detailRouteSub = undefined;
    this.listEditRouteSub?.unsubscribe();
    this.abortListEditHttp();
    this.listEditRouteSub = route.paramMap
      .pipe(
        map((pm) => parseListIdFromParam(pm.get('listId'))),
        distinctUntilChanged(),
        switchMap((id) =>
          id === null ? throwError(() => new Error('invalid list id')) : this.api.getList(id),
        ),
      )
      .subscribe({
        next: (list) => {
          this.listEdit.set(list);
          form.patchValue({ name: list.name });
          this.listEditSaveAttempted.set(false);
          this.publish({ type: 'LIST_EDIT_LOADED', list });
        },
        error: () => {
          this.listEdit.set(null);
          this.publish({ type: 'LIST_EDIT_LOAD_FAILED' });
        },
      });
  }

  private applyListEditSave(e: Extract<ListsIntent, { type: 'LIST_EDIT_SAVE' }>): void {
    const { name, correlationId } = e;
    const list = this.listEdit();
    if (!list || this.listEditSubmitting()) {
      return;
    }
    this.listEditSubmitting.set(true);
    this.api
      .updateList(list.id, { name })
      .pipe(
        takeUntil(this.listEditHttpAbort$),
        finalize(() => {
          this.listEditSubmitting.set(false);
        }),
      )
      .subscribe({
        next: (updated) => {
          this.listEdit.set(updated);
          void this.router.navigate(['/lists', updated.id], { replaceUrl: true });
          this.publish({ type: 'LIST_EDIT_SAVE_SUCCEEDED', list: updated, correlationId });
        },
        error: () => {
          this.publish({ type: 'LIST_EDIT_SAVE_FAILED', correlationId });
        },
      });
  }

  private listEditDelete(e: Extract<ListsIntent, { type: 'LIST_EDIT_DELETE' }>): void {
    const { correlationId } = e;
    const list = this.listEdit();
    if (!list || this.listEditDeleting()) {
      return;
    }
    this.listEditDeleting.set(true);
    this.api
      .deleteList(list.id)
      .pipe(
        switchMap(() => this.api.getLists().pipe(catchError(() => of<GroceryList[]>([])))),
        takeUntil(this.listEditHttpAbort$),
        finalize(() => {
          this.listEditDeleting.set(false);
        }),
      )
      .subscribe({
        next: (lists) => {
          this.publish({ type: 'LIST_EDIT_DELETE_SUCCEEDED', correlationId });
          if (lists.length === 0) {
            void this.router.navigate(['/lists', 'new'], { replaceUrl: true });
          } else {
            void this.router.navigate(['/lists', lists[0].id], { replaceUrl: true });
          }
        },
        error: () => {
          this.publish({ type: 'LIST_EDIT_DELETE_FAILED', correlationId });
        },
      });
  }

  private bindListDetail(route: ActivatedRoute): void {
    this.listEditRouteSub?.unsubscribe();
    this.listEditRouteSub = undefined;
    this.abortListEditHttp();
    this.detailRouteSub?.unsubscribe();
    this.detailRouteSub = subscribeListDetailRoute(route, this.api, this.detailEffects);
  }
}
