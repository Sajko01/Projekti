import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningComponent} from './planning.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
declarations: [PlanningComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
  ],
  exports: [
    PlanningComponent
  ]
})
export class PlanningModule { }
