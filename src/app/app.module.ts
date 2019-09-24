import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-rounting.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { EffectsModule } from '@ngrx/effects';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

import { MenuComponent } from './components/menu/menu.component';
import { Fz700Component } from './components/private/fz700/fz700.component';
import { Tb100Component } from './components/diary/tb100.component';

import { JshhDatabase } from './components/database/database';
import { IdbService, DiaryService, PrivateService } from './services';

import { Tb100DeactivateGuard } from './guards/diary.guard';
import { StoreModule } from '@ngrx/store';
import { reducer } from './reducers/tbeintrag.reducer';
import { AppEffects } from './app.effects';
import { DateComponent } from './components/comp/date/date.component';


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    Fz700Component,
    Tb100Component,
    DateComponent
  ],
  imports: [
    BrowserModule, FormsModule, NgbModule, AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StoreModule.forRoot({ diary: reducer }),
    EffectsModule.forRoot([AppEffects])
  ],
  providers: [
    JshhDatabase, IdbService, DiaryService, PrivateService,
    Tb100DeactivateGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private idbservice: IdbService) {
    console.log(environment.production ? "Produktion" : "Entwicklung");
    // console.log('AppModule ' + this.dbservice.getId().getMilliseconds());
    //idbservice.createDB(); // .then(e => console.log('AppModule ' + e.benutzerId));
  }

 }
