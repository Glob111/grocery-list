import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { EmptyTranslateLoader } from '@testing/empty-translate.loader';
import { GroceryApiService } from '@app/core/services/grocery-api.service';
import { ListsFacade } from '@app/features/lists/state/lists-facade.service';

import { ListNew } from './list-new.component';

describe('ListNew', () => {
  let api: { createList: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { createList: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [
        ListNew,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
        }),
      ],
      providers: [provideRouter([]), ListsFacade, { provide: GroceryApiService, useValue: api }],
    }).compileComponents();
    TestBed.inject(ListsFacade);
  });

  it('submit sets submitAttempted and does not call API when form invalid', () => {
    const fixture = TestBed.createComponent(ListNew);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.submit();
    expect(cmp.submitAttempted()).toBe(true);
    expect(api.createList).not.toHaveBeenCalled();
  });

  it('submit calls createList and navigates on success', () => {
    api.createList.mockReturnValue(of({ id: 5, name: 'Groceries' }));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(ListNew);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.form.controls.name.setValue('Groceries');
    cmp.submit();

    expect(api.createList).toHaveBeenCalledWith('Groceries');
    expect(nav).toHaveBeenCalledWith(['/lists', 5], { replaceUrl: true });
  });

  it('submit sets submitError when API fails', () => {
    api.createList.mockReturnValue(throwError(() => new Error('network')));
    const fixture = TestBed.createComponent(ListNew);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.form.controls.name.setValue('A');
    cmp.submit();
    expect(cmp.submitError()).toBe(true);
    expect(cmp.submitting()).toBe(false);
  });
});
