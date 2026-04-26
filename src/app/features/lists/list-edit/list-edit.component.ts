import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { GroceryList } from '@app/core/models/grocery.models';
import { GroceryApiService } from '@app/core/services/grocery-api.service';
import { parseListIdFromParam } from '@app/core/utils/parse-list-id';

@Component({
  selector: 'app-list-edit',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './list-edit.component.html',
})
export class ListEdit implements OnInit {
  readonly list = signal<GroceryList | null>(null);
  readonly hasLoadError = signal(false);
  readonly saveError = signal(false);
  readonly deleteError = signal(false);
  readonly submitting = signal(false);
  readonly deleting = signal(false);
  readonly saveAttempted = signal(false);

  readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(GroceryApiService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((pm) => parseListIdFromParam(pm.get('listId'))),
        distinctUntilChanged(),
        switchMap((id) =>
          id === null ? throwError(() => new Error('invalid list id')) : this.api.getList(id),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (list) => {
          this.list.set(list);
          this.form.patchValue({ name: list.name });
          this.hasLoadError.set(false);
          this.saveError.set(false);
          this.deleteError.set(false);
          this.saveAttempted.set(false);
        },
        error: () => {
          this.list.set(null);
          this.hasLoadError.set(true);
        },
      });
  }

  save(): void {
    const list = this.list();
    if (!list || this.submitting()) {
      return;
    }
    this.saveAttempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.controls.name.value.trim();
    if (!name) {
      return;
    }
    this.submitting.set(true);
    this.saveError.set(false);
    this.deleteError.set(false);
    this.api
      .updateList(list.id, { name })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.list.set(updated);
          void this.router.navigate(['/lists', updated.id], { replaceUrl: true });
        },
        error: () => {
          this.saveError.set(true);
          this.submitting.set(false);
        },
      });
  }

  deleteList(): void {
    const list = this.list();
    if (!list || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.saveError.set(false);
    this.deleteError.set(false);
    this.api
      .deleteList(list.id)
      .pipe(
        switchMap(() => this.api.getLists().pipe(catchError(() => of<GroceryList[]>([])))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (lists) => {
          this.deleting.set(false);
          if (lists.length === 0) {
            void this.router.navigate(['/lists', 'new'], { replaceUrl: true });
          } else {
            void this.router.navigate(['/lists', lists[0].id], { replaceUrl: true });
          }
        },
        error: () => {
          this.deleteError.set(true);
          this.deleting.set(false);
        },
      });
  }
}
