import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as FzNotizActions from './actions/fznotiz.actions'
import * as GlobalActions from './actions/global.actions';
import * as TbEintragActions from './actions/tbeintrag.actions';
import { DiaryService } from './services/diary.service';
import { UserService } from './services/user.service';
import { PrivateService } from './services';

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions, private router: Router,
    private diaryservice: DiaryService, private privateservice: PrivateService, private userservice: UserService) {
    // this.addTbEintrag$.subscribe(x => {
    //   //if (x instanceof TbEintragActions.AddTbEintrag) {
    //   //console.log('AppEffects addTbEintrag: xxx ' + x.payload.datum);
    //   console.log('AppEffects addTbEintrag: ' + x);
    //   //}
    // }, e => { console.log('AppEffects addTbEintrag Fehler: ' + e) });
  }

  saveFzNotiz$ = createEffect(() => this.actions$.pipe(
    ofType(FzNotizActions.Save),
    mergeMap(x => this.privateservice.saveMemoOb(x.payload)),
    catchError(e => of(GlobalActions.SetErrorGlobal(e))) // Effect wird beendet.
  ), { resubscribeOnError: false });

  saveTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType(TbEintragActions.SaveTbEintrag),
    mergeMap(x => this.diaryservice.saveEntryOb(x.payload)),
    catchError(e => of(GlobalActions.SetErrorGlobal(e))) // Effect wird beendet.
  ), { resubscribeOnError: false });

  errorTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType(TbEintragActions.ErrorTbEintrag),
    map(a => GlobalActions.SetErrorGlobal(a.payload)),
  ));

  loginGlobal$ = createEffect(() => this.actions$.pipe(
    ofType(GlobalActions.LoginGlobal),
    mergeMap(a => this.userservice.loginOb(a.payload)),
  ));

  loginOkGlobal$ = createEffect(() => this.actions$.pipe(
    ofType(GlobalActions.LoginOkGlobal),
    tap(() => this.router.navigate(['/']))
  ), { dispatch: false });

  saveReplGlobal$ = createEffect(() => this.actions$.pipe(
    ofType(GlobalActions.SaveReplGlobal),
    mergeMap(a => this.userservice.saveParamOb('ReplicationServer', a.payload)),
  ));

  saveReplOkGlobal$ = createEffect(() => this.actions$.pipe(
    ofType(GlobalActions.SaveReplOkGlobal),
    tap(() => this.router.navigate(['/']))
  ), { dispatch: false });

}
