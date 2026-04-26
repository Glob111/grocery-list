import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { EmptyTranslateLoader } from '@testing/empty-translate.loader';

import { GroceryList } from '@app/core/models/grocery.models';
import { GroceryApiService } from '@app/core/services/grocery-api.service';

import { ListEdit } from './list-edit.component';

describe('ListEdit', () => {
  let api: {
    getList: ReturnType<typeof vi.fn>;
    updateList: ReturnType<typeof vi.fn>;
    deleteList: ReturnType<typeof vi.fn>;
    getLists: ReturnType<typeof vi.fn>;
  };
  const paramMap$ = new BehaviorSubject(convertToParamMap({ listId: '2' }));

  beforeEach(async () => {
    paramMap$.next(convertToParamMap({ listId: '2' }));
    api = {
      getList: vi.fn(),
      updateList: vi.fn(),
      deleteList: vi.fn(),
      getLists: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [
        ListEdit,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: GroceryApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();
  });

  it('loads list and resets saveAttempted on success', () => {
    const loaded: GroceryList = { id: 2, name: 'Pantry' };
    api.getList.mockReturnValue(of(loaded));
    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.list()).toEqual(loaded);
    expect(cmp.form.controls.name.value).toBe('Pantry');
    expect(cmp.hasLoadError()).toBe(false);
    expect(cmp.saveAttempted()).toBe(false);
  });

  it('sets hasLoadError when getList fails', () => {
    api.getList.mockReturnValue(throwError(() => new Error('404')));
    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasLoadError()).toBe(true);
    expect(fixture.componentInstance.list()).toBeNull();
  });

  it('save sets saveAttempted and does not call API when invalid', () => {
    api.getList.mockReturnValue(of({ id: 2, name: 'X' }));
    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.form.controls.name.setValue('');
    cmp.save();
    expect(cmp.saveAttempted()).toBe(true);
    expect(api.updateList).not.toHaveBeenCalled();
  });

  it('save calls updateList and navigates on success', () => {
    api.getList.mockReturnValue(of({ id: 2, name: 'Old' }));
    api.updateList.mockReturnValue(of({ id: 2, name: 'New' }));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.form.controls.name.setValue('New');
    cmp.save();

    expect(api.updateList).toHaveBeenCalledWith(2, { name: 'New' });
    expect(nav).toHaveBeenCalledWith(['/lists', 2], { replaceUrl: true });
  });

  it('save sets saveError on API failure', () => {
    api.getList.mockReturnValue(of({ id: 2, name: 'Old' }));
    api.updateList.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.form.controls.name.setValue('New');
    cmp.save();
    expect(cmp.saveError()).toBe(true);
    expect(cmp.submitting()).toBe(false);
  });

  it('deleteList navigates to first list when lists remain', () => {
    api.getList.mockReturnValue(of({ id: 2, name: 'A' }));
    api.deleteList.mockReturnValue(of(null));
    api.getLists.mockReturnValue(of([{ id: 5, name: 'Other' }]));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    fixture.componentInstance.deleteList();

    expect(api.deleteList).toHaveBeenCalledWith(2);
    expect(nav).toHaveBeenCalledWith(['/lists', 5], { replaceUrl: true });
  });

  it('deleteList navigates to new when getLists returns empty', () => {
    api.getList.mockReturnValue(of({ id: 2, name: 'A' }));
    api.deleteList.mockReturnValue(of(null));
    api.getLists.mockReturnValue(of([]));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    fixture.componentInstance.deleteList();

    expect(nav).toHaveBeenCalledWith(['/lists', 'new'], { replaceUrl: true });
  });

  it('deleteList navigates to new when getLists fails after delete', () => {
    api.getList.mockReturnValue(of({ id: 2, name: 'A' }));
    api.deleteList.mockReturnValue(of(null));
    api.getLists.mockReturnValue(throwError(() => new Error('network')));
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    fixture.componentInstance.deleteList();

    expect(api.deleteList).toHaveBeenCalledWith(2);
    expect(nav).toHaveBeenCalledWith(['/lists', 'new'], { replaceUrl: true });
    expect(fixture.componentInstance.deleting()).toBe(false);
  });

  it('sets hasLoadError when route listId is invalid', () => {
    paramMap$.next(convertToParamMap({ listId: 'not-a-number' }));
    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    expect(api.getList).not.toHaveBeenCalled();
    expect(fixture.componentInstance.hasLoadError()).toBe(true);
    expect(fixture.componentInstance.list()).toBeNull();
  });

  it('deleteList sets deleteError when delete fails', () => {
    api.getList.mockReturnValue(of({ id: 2, name: 'A' }));
    api.deleteList.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ListEdit);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.deleteList();
    expect(cmp.deleteError()).toBe(true);
    expect(cmp.deleting()).toBe(false);
  });
});
