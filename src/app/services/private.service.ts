import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import Dexie from 'dexie';
import { FzNotiz } from '../apis';
import { AppState } from '../app.state';
import { JshhDatabase } from '../components/database/database';
import { BaseService } from './base.service';
import { Global } from './global';
import * as GlobalActions from '../actions/global.actions';

@Injectable({
  providedIn: 'root'
})
export class PrivateService extends BaseService {

  constructor(private store: Store<AppState>, db: JshhDatabase) {
    super(db);
  }

  memos: FzNotiz[] = [];

  getNotizListe(replidne: string): Dexie.Promise<FzNotiz[]> {

    if (Global.nes(replidne))
      return this.db.FzNotiz.toArray();
    else
      return this.db.FzNotiz.where('replid').notEqual(replidne).toArray();
  }

  loadMemos(): void {
    this.getNotizListe(null).then(l => { if (l != null) this.memos = l; })
      .catch(e => this.store.dispatch(GlobalActions.SetErrorGlobal(e)));
  }
}
