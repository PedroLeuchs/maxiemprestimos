import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EmprestimosRoutingModule } from './emprestimos-routing.module';
import { EmprestimosComponent } from './emprestimos/emprestimos.component';

@NgModule({
  imports: [
    CommonModule,
    EmprestimosRoutingModule,
    ReactiveFormsModule,
    EmprestimosComponent,
  ],
})
export class EmprestimosModule {}
