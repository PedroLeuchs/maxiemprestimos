import { Routes } from '@angular/router';
import { EmprestimosComponent } from './emprestimos/emprestimos/emprestimos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'clients', pathMatch: 'full' },
  {
    path: 'clients',
    loadChildren: () =>
      import('./clients/clients.module').then((m) => m.ClientsModule),
  },
  {
    path: 'emprestimos',
    loadChildren: () =>
      import('./emprestimos/emprestimos.module').then(
        (m) => m.EmprestimosModule
      ),
  },
];
