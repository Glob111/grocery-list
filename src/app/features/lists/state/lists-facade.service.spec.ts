import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { firstValueFrom, of, throwError } from 'rxjs';

import { GroceryApiService } from '@app/core/services/grocery-api.service';
import { ListsEventsBus } from '@app/features/lists/state/lists-events-bus.service';
import { ListsFacade } from '@app/features/lists/state/lists-facade.service';
import { isListsResult } from '@app/features/lists/state/lists.events';

describe('ListsFacade (bus)', () => {
  let api: { createList: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { createList: vi.fn() };
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), ListsFacade, { provide: GroceryApiService, useValue: api }],
    }).compileComponents();
    TestBed.inject(ListsFacade);
  });

  it('emits LIST_NEW_FAILED with correlationId when createList errors', async () => {
    api.createList.mockReturnValue(throwError(() => new Error('x')));
    const bus = TestBed.inject(ListsEventsBus);
    const promise = firstValueFrom(bus.events$.pipe(filter(isListsResult), take(1)));
    bus.emit({ type: 'LIST_NEW_SUBMIT', name: 'Test', correlationId: 'cid-1' });
    await expect(promise).resolves.toEqual({ type: 'LIST_NEW_FAILED', correlationId: 'cid-1' });
  });

  it('emits LIST_NEW_SUCCEEDED with correlationId when createList succeeds', async () => {
    api.createList.mockReturnValue(of({ id: 9, name: 'Test' }));
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const bus = TestBed.inject(ListsEventsBus);
    const promise = firstValueFrom(bus.events$.pipe(filter(isListsResult), take(1)));
    bus.emit({ type: 'LIST_NEW_SUBMIT', name: 'Test', correlationId: 'id-2' });
    const r = await promise;
    expect(r).toEqual({
      type: 'LIST_NEW_SUCCEEDED',
      list: { id: 9, name: 'Test' },
      correlationId: 'id-2',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/lists', 9], { replaceUrl: true });
  });
});
