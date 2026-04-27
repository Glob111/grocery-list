import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { filterBusMessageByTypes } from '@app/features/lists/state/lists-bus-message.operators';
import { newListsCorrelationId } from '@app/features/lists/state/lists-correlation';
import { ListsEventsBus } from '@app/features/lists/state/lists-events-bus.service';
import { ListsFacade } from '@app/features/lists/state/lists-facade.service';
import { LISTS_EDIT_RESULT_TYPES, ListsEditResult } from '@app/features/lists/state/lists.events';

@Component({
  selector: 'app-list-edit',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './list-edit.component.html',
})
export class ListEdit implements OnInit {
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
  });

  readonly loadError = signal(false);
  readonly saveError = signal(false);
  readonly deleteError = signal(false);

  readonly facade = inject(ListsFacade);
  private readonly listsBus = inject(ListsEventsBus);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  private lastSaveCorrelationId: string | null = null;
  private lastDeleteCorrelationId: string | null = null;

  ngOnInit(): void {
    this.listsBus.events$
      .pipe(filterBusMessageByTypes(LISTS_EDIT_RESULT_TYPES), takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        this.onEditBusResult(e);
      });
    this.listsBus.emit({
      type: 'LIST_EDIT_BIND',
      route: this.route,
      form: this.form,
    });
  }

  save(): void {
    if (!this.facade.listEdit() || this.facade.listEditSubmitting()) {
      return;
    }
    this.facade.listEditSaveAttempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.controls.name.value.trim();
    if (!name) {
      return;
    }
    this.saveError.set(false);
    const correlationId = newListsCorrelationId();
    this.lastSaveCorrelationId = correlationId;
    this.listsBus.emit({ type: 'LIST_EDIT_SAVE', name, correlationId });
  }

  deleteList(): void {
    const correlationId = newListsCorrelationId();
    this.lastDeleteCorrelationId = correlationId;
    this.deleteError.set(false);
    this.listsBus.emit({ type: 'LIST_EDIT_DELETE', correlationId });
  }

  private onEditBusResult(e: ListsEditResult): void {
    switch (e.type) {
      case 'LIST_EDIT_LOADED':
        this.loadError.set(false);
        this.saveError.set(false);
        this.deleteError.set(false);
        break;
      case 'LIST_EDIT_LOAD_FAILED':
        this.loadError.set(true);
        break;
      case 'LIST_EDIT_SAVE_SUCCEEDED':
        if (!this.matchesCorrelation(e.correlationId, this.lastSaveCorrelationId)) {
          return;
        }
        this.saveError.set(false);
        break;
      case 'LIST_EDIT_SAVE_FAILED':
        if (!this.matchesCorrelation(e.correlationId, this.lastSaveCorrelationId)) {
          return;
        }
        this.saveError.set(true);
        break;
      case 'LIST_EDIT_DELETE_SUCCEEDED':
        if (!this.matchesCorrelation(e.correlationId, this.lastDeleteCorrelationId)) {
          return;
        }
        this.deleteError.set(false);
        break;
      case 'LIST_EDIT_DELETE_FAILED':
        if (!this.matchesCorrelation(e.correlationId, this.lastDeleteCorrelationId)) {
          return;
        }
        this.deleteError.set(true);
        break;
      default: {
        const exhaustive: never = e;
        void exhaustive;
      }
    }
  }

  private matchesCorrelation(incoming: string | undefined, expected: string | null): boolean {
    if (incoming === undefined) {
      return true;
    }
    return expected !== null && incoming === expected;
  }
}
