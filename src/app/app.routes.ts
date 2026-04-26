import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lists' },
  {
    path: 'lists',
    loadComponent: () =>
      import('./features/lists/lists-shell/lists-shell.component').then((m) => m.ListsShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/lists/list-redirect/list-redirect.component').then(
            (m) => m.ListRedirect,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/lists/list-new/list-new.component').then((m) => m.ListNew),
      },
      {
        path: ':listId/edit',
        loadComponent: () =>
          import('./features/lists/list-edit/list-edit.component').then((m) => m.ListEdit),
      },
      {
        path: ':listId',
        loadComponent: () =>
          import('./features/lists/list-detail/list-detail.component').then((m) => m.ListDetail),
      },
    ],
  },
  { path: '**', redirectTo: 'lists' },
];
