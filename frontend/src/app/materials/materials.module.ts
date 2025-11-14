import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms'; // 
import { MaterialComponent } from './materials.component';

@NgModule({
  declarations: [MaterialComponent],
  imports: [
    CommonModule,
    FormsModule, 
  ]
})
export class MaterialModule {}
