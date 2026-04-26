import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { EmptyTranslateLoader } from '@testing/empty-translate.loader';

import { GroceryApiService } from '@app/core/services/grocery-api.service';

import { ListsShell } from './lists-shell.component';

describe('ListsShell', () => {
  let api: { getLists: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { getLists: vi.fn() };
    api.getLists.mockReturnValue(of([{ id: 1, name: 'A' }]));

    await TestBed.configureTestingModule({
      imports: [
        ListsShell,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
        }),
      ],
      providers: [provideRouter([]), { provide: GroceryApiService, useValue: api }],
    }).compileComponents();
  });

  it('loads lists on init', () => {
    const fixture = TestBed.createComponent(ListsShell);
    fixture.detectChanges();
    expect(api.getLists).toHaveBeenCalled();
    expect(fixture.componentInstance.lists()).toEqual([{ id: 1, name: 'A' }]);
    expect(fixture.componentInstance.hasLoadError()).toBe(false);
  });

  it('setLang persists code, switches translate, updates html lang', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const doc = TestBed.inject(DOCUMENT);
    const fixture = TestBed.createComponent(ListsShell);
    const translateSvc = TestBed.inject(TranslateService);
    const useSpy = vi.spyOn(translateSvc, 'use').mockReturnValue(of({}));
    fixture.detectChanges();
    fixture.componentInstance.setLang('en');
    expect(setItem).toHaveBeenCalledWith('lang', 'en');
    expect(useSpy).toHaveBeenCalledWith('en');
    expect(doc.documentElement.lang).toBe('en');
    setItem.mockRestore();
  });

  it('setLang uses uk for document when switching to uk', () => {
    const doc = TestBed.inject(DOCUMENT);
    const fixture = TestBed.createComponent(ListsShell);
    const translateSvc = TestBed.inject(TranslateService);
    vi.spyOn(translateSvc, 'use').mockReturnValue(of({}));
    fixture.detectChanges();
    fixture.componentInstance.setLang('uk');
    expect(doc.documentElement.lang).toBe('uk');
  });

  it('sets hasLoadError when initial getLists fails', () => {
    api.getLists.mockReturnValue(throwError(() => new Error('x')));
    const fixture = TestBed.createComponent(ListsShell);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasLoadError()).toBe(true);
  });
});
