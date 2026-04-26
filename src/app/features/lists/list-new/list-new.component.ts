import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GroceryApiService } from '@app/core/services/grocery-api.service';

@Component({
  selector: 'app-list-new',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './list-new.component.html',
})
export class ListNew {
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
  });

  readonly submitting = signal(false);
  readonly submitError = signal(false);
  readonly submitAttempted = signal(false);

  private readonly api = inject(GroceryApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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
    this.api
      .createList(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          void this.router.navigate(['/lists', list.id], { replaceUrl: true });
        },
        error: () => {
          this.submitError.set(true);
          this.submitting.set(false);
        },
      });
  }
}
