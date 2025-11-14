import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { MachinesComponent } from './machines.component';

@NgModule({
  declarations: [
    MachinesComponent, 
  ],
  imports: [
    CommonModule,
    FormsModule 
  ],
  exports: [
    MachinesComponent 
  ]
})
export class MachinesModule { }
