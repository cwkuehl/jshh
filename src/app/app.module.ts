import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-rounting.module';

import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';
import { Fz700Component } from './components/private/fz700/fz700.component';
import { Tb100Component } from './components/diary/tb100.component';

import { IdbService } from './services';
import { DiaryService, PrivateService } from './services';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    Fz700Component,
    Tb100Component
  ],
  imports: [
    BrowserModule, NgbModule, AppRoutingModule
  ],
  providers: [
    IdbService, DiaryService, PrivateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private idbservice: IdbService) {
    // console.log('AppModule ' + this.dbservice.getId().getMilliseconds());
    //idbservice.createDB(); // .then(e => console.log('AppModule ' + e.benutzerId));
  }

 }
