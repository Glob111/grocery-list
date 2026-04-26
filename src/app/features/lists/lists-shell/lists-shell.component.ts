import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { merge, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { GroceryList } from '@app/core/models/grocery.models';
import { GroceryApiService } from '@app/core/services/grocery-api.service';

@Component({
  selector: 'app-lists-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './lists-shell.component.html',
  styleUrls: ['./lists-shell.component.scss'],
})
export class ListsShell implements OnInit {
  readonly lists = signal<GroceryList[]>([]);
  readonly hasLoadError = signal(false);
  readonly currentLang = signal<'uk' | 'en'>('uk');

  private readonly api = inject(GroceryApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.currentLang.set(this.translate.currentLang === 'en' ? 'en' : 'uk');
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
      this.currentLang.set(e.lang === 'en' ? 'en' : 'uk');
    });

    merge(
      of(null),
      this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    )
      .pipe(
        switchMap(() =>
          this.api.getLists().pipe(
            map((lists) => ({ ok: true as const, lists })),
            catchError(() => of({ ok: false as const })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result.ok) {
          this.lists.set(result.lists);
          this.hasLoadError.set(false);
        } else {
          this.hasLoadError.set(true);
        }
      });
  }

  setLang(code: 'uk' | 'en'): void {
    localStorage.setItem('lang', code);
    this.translate
      .use(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.document.documentElement.lang = code === 'uk' ? 'uk' : 'en';
      });
  }
}
