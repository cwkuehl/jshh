import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
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
import { CellComponent } from './components/comp/cell.component';
import { DateComponent } from './components/comp/date.component';
import { Date2Component } from './components/comp/date2.component';
import { JshhDatabase } from './services/database';
import { MenuComponent } from './components/menu.component';
import { Am000Component } from './components/user/am000.component';
import { Am500Component } from './components/user/am500.component';
import { Fz700Component } from './components/private/fz700.component';
import { Fz710Component } from './components/private/fz710.component';
import { Hh400Component } from './components/budget/hh400.component';
import { Hh410Component } from './components/budget/hh410.component';
import { So100Component } from './components/misc/so100.component';
import { Tb100Component } from './components/diary/tb100.component';
import { Tb100DeactivateGuard } from './guards/diary.guard';
import * as Reducer from './reducers/reducer';
import { BudgetService, DiaryService, PrivateService, UserService, SudokuService } from './services';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    CellComponent,
    DateComponent,
    Date2Component,
    Am000Component,
    Am500Component,
    Fz700Component,
    Fz710Component,
    Hh400Component,
    Hh410Component,
    So100Component,
    Tb100Component,
  ],
  imports: [
    BrowserModule, FormsModule, NgbModule, AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StoreModule.forRoot({
      globalError: Reducer.reducerGlobalError,
      userId: Reducer.reducerUserId,
      options: Reducer.reducerOptions,
      memos: Reducer.reducerMemos,
      diary: Reducer.reducerDiary,
    }),
    EffectsModule.forRoot([AppEffects]),
    HttpClientModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de' },
    JshhDatabase,
    BudgetService,
    DiaryService,
    PrivateService,
    SudokuService,
    UserService,
    Tb100DeactivateGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private userservice: UserService, private store: Store<AppState>) {
    console.log(environment.production ? "Produktion" : "Entwicklung");
    // console.log('AppModule ' + this.dbservice.getId().getMilliseconds());
    registerLocaleData(localeDe); // , 'de-DE');
    userservice.getParameter('UserId').then(p => { if (p != null) store.dispatch(GlobalActions.LoginOk(p.wert)); })
      .catch(e => console.error(e));
    userservice.getOptions().then(p => { if (p != null) store.dispatch(GlobalActions.SaveOptionsOk({ options: p })); })
      .catch(e => console.error(e));
  }
}
