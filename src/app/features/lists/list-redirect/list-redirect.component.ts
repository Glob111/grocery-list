import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GroceryApiService } from '@app/core/services/grocery-api.service';

@Component({
  selector: 'app-list-redirect',
  imports: [TranslateModule],
  templateUrl: './list-redirect.component.html',
  styleUrls: ['./list-redirect.component.scss'],
})
export class ListRedirect implements OnInit {
  private readonly api = inject(GroceryApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.api
      .getLists()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
}
