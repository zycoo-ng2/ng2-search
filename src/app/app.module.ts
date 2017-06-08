import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TabsModule, ButtonsModule } from 'ngx-bootstrap';
import { SelectModule } from '../select/select.module'
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SelectModule,
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
