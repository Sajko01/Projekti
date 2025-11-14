

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsComponent } from './reports.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    FormsModule, 
     MatCardModule,
  ],
  exports: [ReportsComponent] 
})
export class ReportsModule { }

