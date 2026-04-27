import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ListsBusMessage } from './lists.events';

/** Single stream: {@link ListsIntent} from components, {@link ListsResult} from {@link ListsFacade}. */
@Injectable({ providedIn: 'root' })
export class ListsEventsBus {
  readonly events$: Observable<ListsBusMessage>;
  private readonly subject = new Subject<ListsBusMessage>();

  constructor() {
    this.events$ = this.subject.asObservable();
  }

  emit(message: ListsBusMessage): void {
    this.subject.next(message);
  }
}
