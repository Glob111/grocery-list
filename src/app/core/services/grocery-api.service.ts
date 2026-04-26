import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { GroceryItem, GroceryItemDraft, GroceryList } from '@app/core/models/grocery.models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class GroceryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getLists(): Observable<GroceryList[]> {
    return this.http
      .get<GroceryList[]>(`${this.baseUrl}/lists`, {
        headers: new HttpHeaders({
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        }),
      })
      .pipe(map((lists) => [...lists].sort((a, b) => a.id - b.id)));
  }

  getList(id: number): Observable<GroceryList> {
    return this.http.get<GroceryList>(`${this.baseUrl}/lists/${id}`);
  }

  createList(name: string): Observable<GroceryList> {
    return this.http.post<GroceryList>(`${this.baseUrl}/lists`, { name });
  }

  updateList(id: number, body: Partial<Pick<GroceryList, 'name'>>): Observable<GroceryList> {
    return this.http.patch<GroceryList>(`${this.baseUrl}/lists/${id}`, body);
  }

  deleteList(id: number): Observable<unknown> {
    return this.getItems(id).pipe(
      switchMap((items) =>
        items.length === 0
          ? of(null)
          : forkJoin(items.map((item) => this.http.delete(`${this.baseUrl}/items/${item.id}`))),
      ),
      switchMap(() => this.http.delete(`${this.baseUrl}/lists/${id}`)),
    );
  }

  getItems(listId: number): Observable<GroceryItem[]> {
    return this.http.get<GroceryItem[]>(`${this.baseUrl}/items?listId=${listId}`);
  }

  createItem(draft: GroceryItemDraft): Observable<GroceryItem> {
    return this.http.post<GroceryItem>(`${this.baseUrl}/items`, {
      ...draft,
      bought: false,
    });
  }

  updateItem(
    id: number,
    body: Partial<Pick<GroceryItem, 'title' | 'amount' | 'bought'>>,
  ): Observable<GroceryItem> {
    return this.http.patch<GroceryItem>(`${this.baseUrl}/items/${id}`, body);
  }

  deleteItem(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/items/${id}`);
  }
}
