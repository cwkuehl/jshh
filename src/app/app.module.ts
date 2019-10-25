import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { environment } from '../environments/environment';
import * as GlobalActions from './actions/global.actions';
import { AppRoutingModule } from './app-rounting.module';
import { AppComponent } from './app.component';
import { AppEffects } from './app.effects';
import { AppState } from './app.state';
import { DateComponent } from './components/comp/date/date.component';
import { JshhDatabase } from './components/database/database';
import { Tb100Component } from './components/diary/tb100.component';
import { MenuComponent } from './components/menu/menu.component';
import { Fz700Component } from './components/private/fz700.component';
import { Am000Component } from './components/user/am000.component';
import { Am500Component } from './components/user/am500/am500.component';
import { Tb100DeactivateGuard } from './guards/diary.guard';
import * as Reducer from './reducers/reducer';
import { DiaryService, PrivateService, UserService } from './services';


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    Fz700Component,
    Tb100Component,
    DateComponent,
    Am000Component,
    Am500Component
  ],
  imports: [
    BrowserModule, FormsModule, NgbModule, AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StoreModule.forRoot({
      globalError: Reducer.reducerGlobalError,
      userId: Reducer.reducerUserId,
      replicationServer: Reducer.reducerReplicationServer,
      memos: Reducer.reducerMemos,
      diary: Reducer.reducerDiary,
    }),
    EffectsModule.forRoot([AppEffects]),
    HttpClientModule
  ],
  providers: [
    JshhDatabase, DiaryService, PrivateService, UserService,
    Tb100DeactivateGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private userservice: UserService, private store: Store<AppState>) {
    console.log(environment.production ? "Produktion" : "Entwicklung");
    // console.log('AppModule ' + this.dbservice.getId().getMilliseconds());
    userservice.getParameter('UserId').then(p => { if (p != null) store.dispatch(GlobalActions.LoginOk(p.wert)); })
      .catch(e => console.error(e));
    userservice.getParameter('ReplicationServer').then(p => { if (p != null) store.dispatch(GlobalActions.SaveReplOk(p.wert)); })
      .catch(e => console.error(e));
  }
}
