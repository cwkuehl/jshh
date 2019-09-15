import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import { Action } from '@ngrx/store';
import * as TbEintragActions from './actions/tbeintrag.actions'
//import { Database } from '@ngrx/db';

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions) {
    this.addTbEintrag$.subscribe(x => {
      //if (x instanceof TbEintragActions.AddTbEintrag) {
        console.log('AppEffects addTbEintrag: xxx ' + x.payload.datum);
      //}
    });
  }

  addTbEintrag$ = createEffect(() => this.actions$.pipe(
    ofType<TbEintragActions.AddTbEintrag>(TbEintragActions.ADD_TB_EINTRAG),
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
  //   ofType(TbEintragActions.ADD_TB_EINTRAG)
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
