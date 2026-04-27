import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { EmptyTranslateLoader } from '@testing/empty-translate.loader';

import { GroceryApiService } from '@app/core/services/grocery-api.service';
import { ListsFacade } from '@app/features/lists/state/lists-facade.service';

import { ListRedirect } from './list-redirect.component';

describe('ListRedirect', () => {
  let api: { getLists: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { getLists: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [
        ListRedirect,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
        }),
      ],
      providers: [provideRouter([]), ListsFacade, { provide: GroceryApiService, useValue: api }],
    }).compileComponents();
    TestBed.inject(ListsFacade);
  });

  it('navigates to first list id when lists exist', () => {
    api.getLists.mockReturnValue(of([{ id: 7, name: 'A' }]));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ListRedirect);
    fixture.componentInstance.ngOnInit();
    expect(nav).toHaveBeenCalledWith(['/lists', 7], { replaceUrl: true });
  });

  it('navigates to new when lists empty', () => {
    api.getLists.mockReturnValue(of([]));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ListRedirect);
    fixture.componentInstance.ngOnInit();
    expect(nav).toHaveBeenCalledWith(['/lists', 'new'], { replaceUrl: true });
  });

  it('navigates to new when getLists errors', () => {
    api.getLists.mockReturnValue(throwError(() => new Error('fail')));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ListRedirect);
    fixture.componentInstance.ngOnInit();
    expect(nav).toHaveBeenCalledWith(['/lists', 'new'], { replaceUrl: true });
  });
});
