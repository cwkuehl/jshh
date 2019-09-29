import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, empty , EMPTY, throwError, of, pipe, Observable } from 'rxjs';
import { tap, map, take, mergeMap, catchError, switchMap, mapTo } from 'rxjs/operators';

import { Action } from '@ngrx/store';
import * as TbEintragActions from './actions/tbeintrag.actions'
import * as GlobalActions from './actions/global.actions'
import { JshhDatabase } from './components/database/database';
import { TbEintrag } from './apis';
import { DiaryService } from './services/diary.service';

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions, private diaryservice: DiaryService/*, private db: JshhDatabase*/) {
    // this.addTbEintrag$.subscribe(x => {
    //   //if (x instanceof TbEintragActions.AddTbEintrag) {
    //   //console.log('AppEffects addTbEintrag: xxx ' + x.payload.datum);
    //   console.log('AppEffects addTbEintrag: ' + x);
    //   //}
    // }, e => { console.log('AppEffects addTbEintrag Fehler: ' + e) });
  }

  saveTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType<TbEintragActions.SaveTbEintrag>(TbEintragActions.SAVE_TB_EINTRAG),
    mergeMap(x => this.diaryservice.saveEntryOb(x.payload.datum, x.payload.eintrag)),
    catchError(e => of(new GlobalActions.SetErrorGlobal(e))) // Effect wird beendet.
  ));

  errorTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType<TbEintragActions.ErrorTbEintrag>(TbEintragActions.ERROR_TB_EINTRAG),
    map(a => new GlobalActions.SetErrorGlobal(a.payload)),
  ));
}
