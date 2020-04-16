import { Component, Inject, LOCALE_ID } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from './app.state';
import { Observable } from 'rxjs';
import * as GlobalActions from './actions/global.actions'

@Component({
  selector: 'app-root',
  template: `
<div class="container">
  <app-menu></app-menu>
  <div *ngIf="globalError$ | async as globalError">
    <ngb-alert type="danger" (close)="clearErrorGlobal()">{{ globalError }}</ngb-alert>
  </div>
  <router-outlet></router-outlet>
</div>
  `,
  styles: [``]
})
export class AppComponent {
  title: string = 'JSHH';
  globalError$: Observable<string>;

  constructor(private store: Store<AppState>, @Inject(LOCALE_ID) locale: string) {
    this.globalError$ = store.pipe(select('globalError'));
    console.log('locale', locale);
  }

  clearErrorGlobal() {
    this.store.dispatch(GlobalActions.ClearError());
  }
}
