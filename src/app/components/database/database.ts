import Dexie from 'dexie';
import { FzNotiz, TbEintrag, Parameter, MaReplikation } from '../../apis';
import { Injectable } from '@angular/core';
import { Global } from '../../services/global';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';

const DB_NAME = 'jshh_app';

@Injectable()
export class JshhDatabase extends Dexie {
  userId: string;

  public FzNotiz: Dexie.Table<FzNotiz, string>;
  public MaReplikation: Dexie.Table<MaReplikation, string>;
  public Parameter: Dexie.Table<Parameter, string>;
  public TbEintrag: Dexie.Table<TbEintrag, string>;

  constructor(private store: Store<AppState>) {
    super(DB_NAME);
    store.select('userId').subscribe(x => this.userId = x);
    this.version(1).stores({
      TbEintrag: '&datum,eintrag' // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.version(2).stores({
      MaReplikation: '&replikationUid,tabellenNr',
      Parameter: '&schluessel',
      TbEintrag: '&datum,eintrag' // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.version(3).stores({
      MaReplikation: '&replikationUid,tabellenNr',
      Parameter: '&schluessel',
      TbEintrag: '&datum,eintrag,replid' // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.version(4).stores({
      FzNotiz: '&uid,thema,replid',
      MaReplikation: '&replikationUid,tabellenNr',
      Parameter: '&schluessel',
      TbEintrag: '&datum,eintrag,replid', // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.FzNotiz = this.table('FzNotiz');
    this.MaReplikation = this.table('MaReplikation');
    this.Parameter = this.table('Parameter');
    this.TbEintrag = this.table('TbEintrag');

    //this.FzNotiz.put({uid: Global.getUID(), thema: 'Hallo', notiz: 'nix', angelegtAm: Global.now(), angelegtVon: 'abcd'});
    //this.FzNotiz.put({uid: Global.getUID(), thema: 'Hallo2', notiz: 'nix2', angelegtAm: Global.now(), angelegtVon: 'abcd'});
    //this.TbEintrag.put({datum: Global.date(26,9,2019), eintrag: 'Hallo', angelegtAm: Global.now(), angelegtVon: 'abc'});
    //this.TbEintrag.put({datum: Global.date(27,9,2019), eintrag: 'Hallo2', angelegtAm: Global.now(), angelegtVon: 'abc'});
  }
}
