import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkersComponent } from './workers.component';




@NgModule({
 declarations: [WorkersComponent],
  imports: [
   CommonModule,
    FormsModule,
  ],
  exports: [WorkersComponent]
})
export class WorkersModule { }
