import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-rounting.module';

import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';

import { IdbService } from './services';
import { TagebuchService } from './services';
import { TagebuchComponent } from './components/tagebuch/tagebuch.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    TagebuchComponent
  ],
  imports: [
    BrowserModule, NgbModule, AppRoutingModule
  ],
  providers: [
    IdbService, TagebuchService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
