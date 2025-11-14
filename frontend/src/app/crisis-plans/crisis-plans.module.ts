import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { CrisisPlansComponent } from './crisis-plans.component'; 

@NgModule({
  declarations: [
    CrisisPlansComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    CrisisPlansComponent
  ]
})
export class CrisisPlansModule { }
