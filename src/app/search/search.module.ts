import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectComponent } from './search';
import { HighlightPipe } from './lib/select-pipes';
import { OffClickDirective } from './lib/off-click';

@NgModule({
  imports: [CommonModule],
  declarations: [SelectComponent, HighlightPipe, OffClickDirective],
  exports: [SelectComponent, HighlightPipe, OffClickDirective]
})
export class SearchModule { }
