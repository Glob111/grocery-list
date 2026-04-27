import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { filterBusMessageByTypes } from '@app/features/lists/state/lists-bus-message.operators';
import { newListsCorrelationId } from '@app/features/lists/state/lists-correlation';
import { ListsEventsBus } from '@app/features/lists/state/lists-events-bus.service';
import { LISTS_NEW_RESULT_TYPES } from '@app/features/lists/state/lists.events';

@Component({
  selector: 'app-list-new',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './list-new.component.html',
})
export class ListNew implements OnInit {
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
  });

  readonly submitting = signal(false);
  readonly submitError = signal(false);
  readonly submitAttempted = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private readonly listsBus = inject(ListsEventsBus);
  private lastSubmitCorrelationId: string | null = null;

  ngOnInit(): void {
    this.listsBus.events$
      .pipe(filterBusMessageByTypes(LISTS_NEW_RESULT_TYPES), takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        if (!this.matchesSubmitCorrelation(e.correlationId)) {
          return;
        }
        if (e.type === 'LIST_NEW_FAILED') {
          this.submitError.set(true);
          this.submitting.set(false);
          return;
        }
        this.submitting.set(false);
      });
  }

  submit(): void {
    this.submitAttempted.set(true);
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.controls.name.value.trim();
    if (!name) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(false);
    const correlationId = newListsCorrelationId();
    this.lastSubmitCorrelationId = correlationId;
    this.listsBus.emit({ type: 'LIST_NEW_SUBMIT', name, correlationId });
  }

  private matchesSubmitCorrelation(incoming: string | undefined): boolean {
    if (incoming === undefined) {
      return true;
    }
    return this.lastSubmitCorrelationId !== null && incoming === this.lastSubmitCorrelationId;
  }
}
