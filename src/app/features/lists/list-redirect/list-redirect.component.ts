import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ListsEventsBus } from '@app/features/lists/state/lists-events-bus.service';

@Component({
  selector: 'app-list-redirect',
  imports: [TranslateModule],
  templateUrl: './list-redirect.component.html',
  styleUrls: ['./list-redirect.component.scss'],
})
export class ListRedirect implements OnInit {
  private readonly listsBus = inject(ListsEventsBus);

  ngOnInit(): void {
    this.listsBus.emit({ type: 'REDIRECT_DEFAULT_LIST' });
  }
}
