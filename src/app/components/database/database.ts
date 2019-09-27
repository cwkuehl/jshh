import Dexie from 'dexie';
import { TbEintrag } from 'src/app/apis';
import { Injectable } from '@angular/core';
import { Global } from 'src/app/services';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';

const DB_NAME = 'jshh_app';

@Injectable()
export class JshhDatabase extends Dexie {
  userId: string;

  public TbEintrag: Dexie.Table<TbEintrag, Date>;

  constructor(private store: Store<AppState>) {
    super(DB_NAME);
    store.select('userId').subscribe(x => this.userId = x);
    this.version(1).stores({
      TbEintrag: '&datum,eintrag' // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.TbEintrag = this.table('TbEintrag');
    //this.TbEintrag.put({datum: Global.date(26,9,2019), eintrag: 'Hallo', angelegtAm: Global.now(), angelegtVon: 'abc'});
    //this.TbEintrag.put({datum: Global.date(27,9,2019), eintrag: 'Hallo2', angelegtAm: Global.now(), angelegtVon: 'abc'});
  }
}
