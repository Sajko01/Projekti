import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MethodsComponent } from './methods.component';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [MethodsComponent],
  imports: [
    CommonModule,
    MatTableModule,
    HttpClientModule
  ],
  exports: [MethodsComponent]
})
export class MethodsModule {}
