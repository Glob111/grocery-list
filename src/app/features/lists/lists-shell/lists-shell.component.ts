import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ListsEventsBus } from '@app/features/lists/state/lists-events-bus.service';
import { ListsFacade } from '@app/features/lists/state/lists-facade.service';

@Component({
  selector: 'app-lists-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './lists-shell.component.html',
  styleUrls: ['./lists-shell.component.scss'],
})
export class ListsShell implements OnInit {
  readonly currentLang = signal<'uk' | 'en'>('uk');
  readonly facade = inject(ListsFacade);
  private readonly listsBus = inject(ListsEventsBus);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.currentLang.set(this.translate.currentLang === 'en' ? 'en' : 'uk');
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
      this.currentLang.set(e.lang === 'en' ? 'en' : 'uk');
    });
    this.listsBus.emit({ type: 'CATALOG_START_AUTO_REFRESH' });
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
