import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GroceryItem } from '@app/core/models/grocery.models';
import { filterBusMessageByTypes } from '@app/features/lists/state/lists-bus-message.operators';
import { newListsCorrelationId } from '@app/features/lists/state/lists-correlation';
import { ListsEventsBus } from '@app/features/lists/state/lists-events-bus.service';
import { ListsFacade } from '@app/features/lists/state/lists-facade.service';
import {
  LISTS_DETAIL_RESULT_TYPES,
  ListsDetailResult,
} from '@app/features/lists/state/lists.events';

@Component({
  selector: 'app-list-detail',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss'],
})
export class ListDetail implements OnInit {
  readonly savingRowId = signal<number | null>(null);
  readonly addSubmitAttempted = signal(false);
  readonly itemSaveValidationIds = signal<ReadonlySet<number>>(new Set());

  readonly addForm = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    amount: [1, [Validators.required, Validators.min(1)]],
  });

  readonly itemsArray = new FormArray<FormGroup>([]);
  readonly facade = inject(ListsFacade);

  private readonly pendingBoughtByItemId = new Map<number, boolean>();
  private readonly saveRowCorrelationById = new Map<number, string>();

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly listsBus = inject(ListsEventsBus);
  private readonly destroyRef = inject(DestroyRef);
  /** FormArray is not a signal: Http + zoneless; keep in sync with screen. */
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.listsBus.events$
      .pipe(filterBusMessageByTypes(LISTS_DETAIL_RESULT_TYPES), takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        this.onDetailBusResult(e);
      });
    this.listsBus.emit({ type: 'LIST_DETAIL_BIND', route: this.route });
  }

  rowGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  itemFields(row: FormGroup): FormGroup {
    return row.get('fields') as FormGroup;
  }

  showItemSaveValidationErrors(row: FormGroup): boolean {
    const id = row.get('id')?.value;
    return typeof id === 'number' && this.itemSaveValidationIds().has(id);
  }

  rowItemId(row: FormGroup): number {
    return row.get('id')?.value as number;
  }

  showItemSaveHttpError(row: FormGroup): boolean {
    return this.facade.detailItemSaveHttpErrorId() === this.rowItemId(row);
  }

  showItemDeleteHttpError(row: FormGroup): boolean {
    return this.facade.detailItemDeleteHttpErrorId() === this.rowItemId(row);
  }

  showItemBoughtHttpError(row: FormGroup): boolean {
    return this.facade.detailItemBoughtHttpErrorId() === this.rowItemId(row);
  }

  canSaveRow(row: FormGroup): boolean {
    const fields = row.get('fields') as FormGroup | null;
    if (!fields?.dirty) {
      return false;
    }
    const id = row.get('id')?.value as number;
    return this.savingRowId() !== id;
  }

  addItem(): void {
    this.addSubmitAttempted.set(true);
    const list = this.facade.detailList();
    if (!list) {
      return;
    }
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const title = this.addForm.controls.title.value.trim();
    const amount = Math.max(1, Math.floor(Number(this.addForm.controls.amount.value)) || 1);
    this.listsBus.emit({
      type: 'LIST_DETAIL_ADD_ITEM',
      draft: { listId: list.id, title, amount },
    });
  }

  saveRow(row: FormGroup): void {
    if (!this.canSaveRow(row)) {
      return;
    }
    const id = row.get('id')?.value as number;
    const fields = row.get('fields') as FormGroup;
    if (!fields.valid) {
      fields.markAllAsTouched();
      this.itemSaveValidationIds.update((s) => new Set(s).add(id));
      return;
    }
    this.itemSaveValidationIds.update((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    const title = (fields.controls['title'].value as string).trim();
    const amount = Math.max(1, Math.floor(Number(fields.controls['amount'].value)) || 1);
    const correlationId = newListsCorrelationId();
    this.saveRowCorrelationById.set(id, correlationId);
    this.savingRowId.set(id);
    this.listsBus.emit({
      type: 'LIST_DETAIL_SAVE_ITEM',
      id,
      body: { title, amount },
      correlationId,
    });
  }

  onBoughtChange(row: FormGroup, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const id = row.get('id')?.value as number;
    this.pendingBoughtByItemId.set(id, !checked);
    this.listsBus.emit({
      type: 'LIST_DETAIL_BOUGHT',
      id,
      bought: checked,
    });
  }

  deleteRow(row: FormGroup): void {
    const id = row.get('id')?.value as number;
    this.listsBus.emit({ type: 'LIST_DETAIL_DELETE_ITEM', id });
  }

  private onDetailBusResult(e: ListsDetailResult): void {
    switch (e.type) {
      case 'LIST_DETAIL_LOADED':
        this.rebuildItemsForm(e.items);
        this.addSubmitAttempted.set(false);
        break;
      case 'LIST_DETAIL_LOAD_FAILED':
        this.itemsArray.clear();
        break;
      case 'LIST_DETAIL_ITEM_CREATED': {
        this.itemsArray.push(this.createItemRow(e.item));
        this.addForm.reset({ title: '', amount: 1 });
        this.addForm.markAsUntouched();
        this.addSubmitAttempted.set(false);
        break;
      }
      case 'LIST_DETAIL_ADD_ITEM_FAILED':
        break;
      case 'LIST_DETAIL_ITEM_SAVED': {
        if (!this.matchesSaveRowCorrelation(e.id, e.correlationId)) {
          break;
        }
        this.saveRowCorrelationById.delete(e.id);
        const row = this.findItemRow(e.id);
        if (!row) {
          break;
        }
        const fields = row.get('fields') as FormGroup;
        const updated = e.item;
        row.patchValue(
          {
            bought: updated.bought,
            fields: { title: updated.title, amount: updated.amount },
          },
          { emitEvent: false },
        );
        fields.markAsPristine();
        this.savingRowId.set(null);
        break;
      }
      case 'LIST_DETAIL_ITEM_SAVE_FAILED':
        if (this.matchesSaveRowCorrelation(e.id, e.correlationId)) {
          this.saveRowCorrelationById.delete(e.id);
          this.savingRowId.set(null);
        }
        break;
      case 'LIST_DETAIL_ITEM_BOUGHT_UPDATED': {
        const row = this.findItemRow(e.id);
        if (row) {
          row.patchValue({ bought: e.item.bought }, { emitEvent: false });
        }
        this.pendingBoughtByItemId.delete(e.id);
        break;
      }
      case 'LIST_DETAIL_ITEM_BOUGHT_FAILED': {
        const row = this.findItemRow(e.id);
        const prev = this.pendingBoughtByItemId.get(e.id);
        this.pendingBoughtByItemId.delete(e.id);
        if (row && prev !== undefined) {
          row.patchValue({ bought: prev }, { emitEvent: false });
        }
        break;
      }
      case 'LIST_DETAIL_ITEM_DELETED': {
        const idx = this.itemsArray.controls.findIndex((c) => c.get('id')?.value === e.id);
        if (idx >= 0) {
          this.itemsArray.removeAt(idx);
        }
        break;
      }
      case 'LIST_DETAIL_ITEM_DELETE_FAILED':
        break;
      default: {
        const exhaustive: never = e;
        void exhaustive;
      }
    }
    this.cdr.markForCheck();
  }

  private matchesSaveRowCorrelation(id: number, incoming: string | undefined): boolean {
    if (incoming === undefined) {
      return true;
    }
    return this.saveRowCorrelationById.get(id) === incoming;
  }

  private findItemRow(id: number): FormGroup | null {
    const row = this.itemsArray.controls.find((c) => c.get('id')?.value === id) as
      | FormGroup
      | undefined;
    return row ?? null;
  }

  private rebuildItemsForm(items: GroceryItem[]): void {
    this.itemSaveValidationIds.set(new Set());
    this.itemsArray.clear();
    for (const item of items) {
      this.itemsArray.push(this.createItemRow(item));
    }
  }

  private createItemRow(item: GroceryItem): FormGroup {
    return this.fb.group({
      id: [item.id],
      bought: [item.bought],
      fields: this.fb.nonNullable.group({
        title: [item.title, [Validators.required, Validators.maxLength(200)]],
        amount: [item.amount, [Validators.required, Validators.min(1)]],
      }),
    });
  }
}
