import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, EMPTY, throwError } from 'rxjs';
import { tap, map, take, mergeMap, catchError, switchMap } from 'rxjs/operators';

import { Action } from '@ngrx/store';
import * as TbEintragActions from './actions/tbeintrag.actions'
import { JshhDatabase } from './components/database/database';
import { TbEintrag } from './apis';
import { DiaryService } from './services/diary.service';


@Injectable()
export class AppEffects {
  constructor(private actions$: Actions, private diaryservice: DiaryService/*, private db: JshhDatabase*/) {
    // this.addTbEintrag$.subscribe(x => {
    //   //if (x instanceof TbEintragActions.AddTbEintrag) {
    //     //console.log('AppEffects addTbEintrag: xxx ' + x.payload.datum);
    //     console.log('AppEffects addTbEintrag: ' + x);
    //   //}
    // });
  }

  addTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType<TbEintragActions.SaveTbEintrag>(TbEintragActions.SAVE_TB_EINTRAG),
    //mergeMap(x => from(this.db.table<TbEintrag>('TbEintrag').where('datum').equals(x.payload.datum).first()))
    mergeMap(x => from(this.diaryservice.saveEntry(x.payload.datum, x.payload.eintrag))), // OK
    //mergeMap(x => from(this.db.table<TbEintrag, Date>('TbEintrag').put(x.payload))), // OK
    //map(x => x.payload),
    //tap((x) => console.log("tap: " + x.payload.datum)),
    //this.db.store()
    //map((x) => x),
    // mergeMap(() => EMPTY //this.moviesService.getAll()
    //   .pipe(
    //     map(movies => ({ type: '[Movies API] Movies Loaded Success', payload: movies })),
    //     catchError(() => EMPTY)
    //   ))
    ), { dispatch: false }
  );

  // @Effect()
  // addTbEintrag$: Observable<Action> = this.actions$.pipe(
  //   ofType(TbEintragActions.SAVE_TB_EINTRAG)
  //   //.debounceTime(300)
  //   //.map(toPayload)
  //   , switchMap(query => {
  //     console.log('AppEffects: ' + query);
  //     return empty();
  //     // if (query === '') {
  //     //   return empty();
  //     // }

  //     // const nextSearch$ = this.actions$.ofType(book.SEARCH).skip(1);

  //     // return this.googleBooks.searchBooks(query)
  //     //   .takeUntil(nextSearch$)
  //     //   .map(books => new book.SearchCompleteAction(books))
  //     //   .catch(() => of(new book.SearchCompleteAction([])));
  //   }));


}
