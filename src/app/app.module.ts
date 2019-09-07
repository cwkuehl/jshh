import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-rounting.module';

import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';

import { IdbService } from './services';
import { DiaryService } from './services';
import { DiaryComponent } from './components/diary/diary.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    DiaryComponent
  ],
  imports: [
    BrowserModule, NgbModule, AppRoutingModule
  ],
  providers: [
    IdbService, DiaryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
