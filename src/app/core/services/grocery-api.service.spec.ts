import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '@env/environment';

import { GroceryApiService } from './grocery-api.service';

describe('GroceryApiService', () => {
  let service: GroceryApiService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroceryApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GroceryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getLists sorts by id ascending', () => {
    let result: unknown;
    service.getLists().subscribe((lists) => {
      result = lists;
    });
    const req = httpMock.expectOne(`${base}/lists`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 3, name: 'c' },
      { id: 1, name: 'a' },
    ]);
    expect(result).toEqual([
      { id: 1, name: 'a' },
      { id: 3, name: 'c' },
    ]);
  });

  it('deleteList deletes items then list', () => {
    let done = false;
    service.deleteList(7).subscribe(() => {
      done = true;
    });

    const itemsReq = httpMock.expectOne(`${base}/items?listId=7`);
    expect(itemsReq.request.method).toBe('GET');
    itemsReq.flush([
      { id: 10, listId: 7, title: 'x', amount: 1, bought: false },
      { id: 11, listId: 7, title: 'y', amount: 2, bought: true },
    ]);

    const del10 = httpMock.expectOne(`${base}/items/10`);
    expect(del10.request.method).toBe('DELETE');
    del10.flush(null);

    const del11 = httpMock.expectOne(`${base}/items/11`);
    expect(del11.request.method).toBe('DELETE');
    del11.flush(null);

    const delList = httpMock.expectOne(`${base}/lists/7`);
    expect(delList.request.method).toBe('DELETE');
    delList.flush(null);

    expect(done).toBe(true);
  });

  it('deleteList skips item deletes when list has no items', () => {
    let done = false;
    service.deleteList(2).subscribe(() => {
      done = true;
    });

    const itemsReq = httpMock.expectOne(`${base}/items?listId=2`);
    itemsReq.flush([]);

    const delList = httpMock.expectOne(`${base}/lists/2`);
    delList.flush(null);

    expect(done).toBe(true);
  });
});
