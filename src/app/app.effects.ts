import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, empty , EMPTY, throwError, of, pipe, Observable } from 'rxjs';
import { tap, map, take, mergeMap, catchError, switchMap, mapTo } from 'rxjs/operators';

import * as TbEintragActions from './actions/tbeintrag.actions'
import * as GlobalActions from './actions/global.actions'
import { DiaryService } from './services/diary.service';
import { UserService } from './services/user.service';

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions, private diaryservice: DiaryService, private userservice: UserService) {
    // this.addTbEintrag$.subscribe(x => {
    //   //if (x instanceof TbEintragActions.AddTbEintrag) {
    //   //console.log('AppEffects addTbEintrag: xxx ' + x.payload.datum);
    //   console.log('AppEffects addTbEintrag: ' + x);
    //   //}
    // }, e => { console.log('AppEffects addTbEintrag Fehler: ' + e) });
  }

  saveTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType(TbEintragActions.SaveTbEintrag),
    mergeMap(x => this.diaryservice.saveEntryOb(x.payload.datum, x.payload.eintrag)),
    catchError(e => of(GlobalActions.SetErrorGlobal(e))) // Effect wird beendet.
  ));

  errorTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType(TbEintragActions.ErrorTbEintrag),
    map(a => GlobalActions.SetErrorGlobal(a.payload)),
  ));

  loginGlobal$ = createEffect(() => this.actions$.pipe(
    ofType(GlobalActions.LoginGlobal),
    mergeMap(a => this.userservice.loginOb(a.payload)),
  ));
}
