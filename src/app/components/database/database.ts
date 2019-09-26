import Dexie from 'dexie';
import { TbEintrag } from 'src/app/apis';
import { Injectable } from '@angular/core';

const DB_NAME = 'jshh_app';

@Injectable()
export class JshhDatabase extends Dexie {
  public TbEintrag: Dexie.Table<TbEintrag, Date>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      TbEintrag: '&datum,eintrag' // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.TbEintrag = this.table('TbEintrag');
  }
}
