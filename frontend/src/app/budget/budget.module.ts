import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetsComponent } from './budget.component';

@NgModule({
  declarations: [BudgetsComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [BudgetsComponent]
})
export class BudgetsModule { }
