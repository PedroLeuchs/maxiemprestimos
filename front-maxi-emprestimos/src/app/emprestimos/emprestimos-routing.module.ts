import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmprestimosComponent } from './emprestimos/emprestimos.component';

const routes: Routes = [
  {
    path: '',
    component: EmprestimosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmprestimosRoutingModule {}
