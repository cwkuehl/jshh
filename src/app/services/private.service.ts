import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import Dexie from 'dexie';
import { FzNotiz } from '../apis';
import { AppState } from '../app.state';
import { JshhDatabase } from '../components/database/database';
import { BaseService } from './base.service';
import { Global } from './global';
import * as GlobalActions from '../actions/global.actions';
import * as FzNotizActions from '../actions/fznotiz.actions'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PrivateService extends BaseService {

  constructor(store: Store<AppState>, db: JshhDatabase, http: HttpClient) {
    super(store, db, http);
  }

  memos: FzNotiz[] = [];

  getNotizListe(replidne: string): Dexie.Promise<FzNotiz[]> {

    if (Global.nes(replidne))
      return this.db.FzNotiz.toArray();
    else
      return this.db.FzNotiz.where('replid').notEqual(replidne).toArray();
  }

  public loadMemos(): void {
    this.getNotizListe(null).then(l => { if (l != null) this.memos = l; })
      .catch(e => this.store.dispatch(GlobalActions.SetErrorGlobal(e)));
  }

  public deleteAllMemosOb(): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.db.FzNotiz.toCollection().delete()
        .then(a => s.next(FzNotizActions.EmptyFzNotiz()))
        .catch(e => s.next(GlobalActions.SetErrorGlobal(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

}
