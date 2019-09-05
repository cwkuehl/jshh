import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';

import { IdbService } from './services';
import { TagebuchService } from './services';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule, NgbModule
  ],
  providers: [
    IdbService, TagebuchService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
