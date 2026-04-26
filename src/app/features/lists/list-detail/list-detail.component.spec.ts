import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { EmptyTranslateLoader } from '@testing/empty-translate.loader';

import { GroceryApiService } from '@app/core/services/grocery-api.service';

import { ListDetail } from './list-detail.component';

function firstItemRow(cmp: ListDetail): FormGroup {
  const row = cmp.itemsArray.at(0);
  expect(row).toBeDefined();
  return row as FormGroup;
}

describe('ListDetail', () => {
  let api: {
    getList: ReturnType<typeof vi.fn>;
    getItems: ReturnType<typeof vi.fn>;
    createItem: ReturnType<typeof vi.fn>;
    updateItem: ReturnType<typeof vi.fn>;
    deleteItem: ReturnType<typeof vi.fn>;
  };
  const paramMap$ = new BehaviorSubject(convertToParamMap({ listId: '1' }));

  beforeEach(async () => {
    paramMap$.next(convertToParamMap({ listId: '1' }));
    api = {
      getList: vi.fn(),
      getItems: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [
        ListDetail,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: GroceryApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
      ],
    }).compileComponents();
  });

  it('loads list and items on success', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'Shop' }));
    api.getItems.mockReturnValue(
      of([{ id: 10, listId: 1, title: 'Milk', amount: 1, bought: false }]),
    );
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.list()).toEqual({ id: 1, name: 'Shop' });
    expect(cmp.hasLoadError()).toBe(false);
    expect(cmp.itemsArray.length).toBe(1);
    expect(cmp.addSubmitAttempted()).toBe(false);
  });

  it('sets hasLoadError when listId param is invalid', () => {
    paramMap$.next(convertToParamMap({ listId: 'x' }));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    expect(api.getList).not.toHaveBeenCalled();
    expect(api.getItems).not.toHaveBeenCalled();
    expect(fixture.componentInstance.hasLoadError()).toBe(true);
    expect(fixture.componentInstance.list()).toBeNull();
  });

  it('sets hasLoadError when forkJoin fails', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    api.getItems.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasLoadError()).toBe(true);
    expect(fixture.componentInstance.list()).toBeNull();
  });

  it('addItem sets addSubmitAttempted and aborts when invalid', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.addForm.controls.title.setValue('');
    cmp.addItem();
    expect(cmp.addSubmitAttempted()).toBe(true);
    expect(api.createItem).not.toHaveBeenCalled();
  });

  it('addItem sets addItemError when createItem fails', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([]));
    api.createItem.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.addForm.controls.title.setValue('Milk');
    cmp.addForm.controls.amount.setValue(1);
    cmp.addItem();
    expect(cmp.addItemError()).toBe(true);
  });

  it('addItem calls API and appends row when valid', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([]));
    api.createItem.mockReturnValue(
      of({ id: 99, listId: 1, title: 'Bread', amount: 2, bought: false }),
    );
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.addForm.controls.title.setValue('Bread');
    cmp.addForm.controls.amount.setValue(2);
    cmp.addItem();
    expect(api.createItem).toHaveBeenCalledWith({ listId: 1, title: 'Bread', amount: 2 });
    expect(cmp.itemsArray.length).toBe(1);
    expect(cmp.addSubmitAttempted()).toBe(false);
  });

  it('canSaveRow is false when fields pristine', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 1, listId: 1, title: 'a', amount: 1, bought: false }]));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    expect(cmp.canSaveRow(row)).toBe(false);
  });

  it('canSaveRow is true when fields dirty and not saving', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 1, listId: 1, title: 'a', amount: 1, bought: false }]));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    cmp.itemFields(row).markAsDirty();
    expect(cmp.canSaveRow(row)).toBe(true);
  });

  it('saveRow records validation ids when form invalid', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 44, listId: 1, title: 'a', amount: 1, bought: false }]));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    cmp.itemFields(row).patchValue({ title: '', amount: 1 });
    cmp.itemFields(row).markAsDirty();
    cmp.saveRow(row);
    expect(cmp.itemSaveValidationIds().has(44)).toBe(true);
    expect(api.updateItem).not.toHaveBeenCalled();
  });

  it('saveRow sets itemSaveHttpErrorId when updateItem fails', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 44, listId: 1, title: 'a', amount: 1, bought: false }]));
    api.updateItem.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    cmp.itemFields(row).patchValue({ title: 'b', amount: 2 });
    cmp.itemFields(row).markAsDirty();
    cmp.saveRow(row);
    expect(cmp.itemSaveHttpErrorId()).toBe(44);
    expect(cmp.savingRowId()).toBeNull();
  });

  it('saveRow calls updateItem when valid', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 44, listId: 1, title: 'a', amount: 1, bought: false }]));
    api.updateItem.mockReturnValue(of({ id: 44, listId: 1, title: 'b', amount: 3, bought: true }));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    cmp.itemFields(row).patchValue({ title: 'b', amount: 3 });
    cmp.itemFields(row).markAsDirty();
    cmp.saveRow(row);
    expect(api.updateItem).toHaveBeenCalledWith(44, { title: 'b', amount: 3 });
    expect(cmp.itemFields(row).pristine).toBe(true);
  });

  it('showItemSaveValidationErrors reflects id set', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 44, listId: 1, title: 'a', amount: 1, bought: false }]));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    cmp.itemSaveValidationIds.set(new Set([44]));
    expect(cmp.showItemSaveValidationErrors(row)).toBe(true);
  });

  it('deleteRow sets itemDeleteHttpErrorId when deleteItem fails', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 44, listId: 1, title: 'a', amount: 1, bought: false }]));
    api.deleteItem.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    cmp.deleteRow(row);
    expect(api.deleteItem).toHaveBeenCalledWith(44);
    expect(cmp.itemDeleteHttpErrorId()).toBe(44);
    expect(cmp.itemsArray.length).toBe(1);
  });

  it('deleteRow removes control and calls API', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 44, listId: 1, title: 'a', amount: 1, bought: false }]));
    api.deleteItem.mockReturnValue(of(null));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    cmp.deleteRow(row);
    expect(api.deleteItem).toHaveBeenCalledWith(44);
    expect(cmp.itemsArray.length).toBe(0);
  });

  it('onBoughtChange calls updateItem with checked value', () => {
    api.getList.mockReturnValue(of({ id: 1, name: 'S' }));
    api.getItems.mockReturnValue(of([{ id: 44, listId: 1, title: 'a', amount: 1, bought: false }]));
    api.updateItem.mockReturnValue(of({ id: 44, listId: 1, title: 'a', amount: 1, bought: true }));
    const fixture = TestBed.createComponent(ListDetail);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const row = firstItemRow(cmp);
    const target = { checked: true } as HTMLInputElement;
    cmp.onBoughtChange(row, { target } as unknown as Event);
    expect(api.updateItem).toHaveBeenCalledWith(44, { bought: true });
  });
});
