import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from './app.state';
import { Observable } from 'rxjs';
import * as GlobalActions from './actions/global.actions'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'JSHH';
  globalError$: Observable<string>;

  constructor(private store: Store<AppState>) {
    this.globalError$ = store.pipe(select('globalError'));
  }

  clearErrorGlobal() {
    this.store.dispatch(GlobalActions.ClearErrorGlobal());
  }
}
