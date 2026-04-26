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
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { GroceryItem, GroceryList } from '@app/core/models/grocery.models';
import { GroceryApiService } from '@app/core/services/grocery-api.service';
import { parseListIdFromParam } from '@app/core/utils/parse-list-id';

@Component({
  selector: 'app-list-detail',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss'],
})
export class ListDetail implements OnInit {
  readonly list = signal<GroceryList | null>(null);
  readonly hasLoadError = signal(false);
  readonly savingRowId = signal<number | null>(null);
  readonly addSubmitAttempted = signal(false);
  readonly itemSaveValidationIds = signal<ReadonlySet<number>>(new Set());
  readonly addItemError = signal(false);
  readonly itemSaveHttpErrorId = signal<number | null>(null);
  readonly itemDeleteHttpErrorId = signal<number | null>(null);
  readonly itemBoughtHttpErrorId = signal<number | null>(null);

  readonly addForm = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    amount: [1, [Validators.required, Validators.min(1)]],
  });

  readonly itemsArray = new FormArray<FormGroup>([]);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(GroceryApiService);
  private readonly destroyRef = inject(DestroyRef);
  /** FormArray updates from HttpClient do not mark the view dirty without Zone; signals alone do not cover controls[]. */
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((pm) => parseListIdFromParam(pm.get('listId'))),
        distinctUntilChanged(),
        switchMap((listId) =>
          listId === null
            ? throwError(() => new Error('invalid list id'))
            : forkJoin({
                list: this.api.getList(listId),
                items: this.api.getItems(listId),
              }).pipe(catchError(() => of(null))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          if (!res) {
            this.hasLoadError.set(true);
            this.list.set(null);
            this.itemsArray.clear();
            return;
          }
          this.hasLoadError.set(false);
          this.list.set(res.list);
          this.rebuildItemsForm(res.items);
          this.addSubmitAttempted.set(false);
        },
        error: () => {
          this.hasLoadError.set(true);
          this.list.set(null);
          this.itemsArray.clear();
        },
      });
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
    const id = this.rowItemId(row);
    return this.itemSaveHttpErrorId() === id;
  }

  showItemDeleteHttpError(row: FormGroup): boolean {
    const id = this.rowItemId(row);
    return this.itemDeleteHttpErrorId() === id;
  }

  showItemBoughtHttpError(row: FormGroup): boolean {
    const id = this.rowItemId(row);
    return this.itemBoughtHttpErrorId() === id;
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
    const list = this.list();
    if (!list) {
      return;
    }
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const title = this.addForm.controls.title.value.trim();
    const amount = Math.max(1, Math.floor(Number(this.addForm.controls.amount.value)) || 1);
    this.addItemError.set(false);
    this.api
      .createItem({ listId: list.id, title, amount })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (item) => {
          this.itemsArray.push(this.createItemRow(item));
          this.addForm.reset({ title: '', amount: 1 });
          this.addForm.markAsUntouched();
          this.addSubmitAttempted.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.addItemError.set(true);
          this.cdr.markForCheck();
        },
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
    this.itemSaveHttpErrorId.set(null);
    const title = (fields.controls['title'].value as string).trim();
    const amount = Math.max(1, Math.floor(Number(fields.controls['amount'].value)) || 1);
    this.savingRowId.set(id);
    this.api
      .updateItem(id, { title, amount })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          row.patchValue(
            {
              bought: updated.bought,
              fields: { title: updated.title, amount: updated.amount },
            },
            { emitEvent: false },
          );
          fields.markAsPristine();
          this.savingRowId.set(null);
          this.itemSaveHttpErrorId.set(null);
          this.cdr.markForCheck();
        },
        error: () => {
          this.savingRowId.set(null);
          this.itemSaveHttpErrorId.set(id);
          this.cdr.markForCheck();
        },
      });
  }

  onBoughtChange(row: FormGroup, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const id = row.get('id')?.value as number;
    this.itemBoughtHttpErrorId.set(null);
    this.api
      .updateItem(id, { bought: checked })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          row.patchValue({ bought: updated.bought }, { emitEvent: false });
          this.itemBoughtHttpErrorId.set(null);
          this.cdr.markForCheck();
        },
        error: () => {
          row.patchValue({ bought: !checked }, { emitEvent: false });
          (event.target as HTMLInputElement).checked = !checked;
          this.itemBoughtHttpErrorId.set(id);
          this.cdr.markForCheck();
        },
      });
  }

  deleteRow(row: FormGroup): void {
    const id = row.get('id')?.value as number;
    this.itemDeleteHttpErrorId.set(null);
    this.api
      .deleteItem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const idx = this.itemsArray.controls.findIndex((c) => c.get('id')?.value === id);
          if (idx >= 0) {
            this.itemsArray.removeAt(idx);
          }
          this.itemDeleteHttpErrorId.set(null);
          this.cdr.markForCheck();
        },
        error: () => {
          this.itemDeleteHttpErrorId.set(id);
          this.cdr.markForCheck();
        },
      });
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
