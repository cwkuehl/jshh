import Dexie from 'dexie';
import { FzNotiz, HhBuchung, TbEintrag, Parameter, MaReplikation, HhKonto, HhEreignis, Sudoku } from '../apis';
import { Injectable } from '@angular/core';
import { Global } from './global';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';

const DB_NAME = 'jshh_app';

@Injectable()
export class JshhDatabase extends Dexie {
  userId: string;

  public FzNotiz: Dexie.Table<FzNotiz, string>;
  public HhBuchung: Dexie.Table<HhBuchung, string>;
  public HhEreignis: Dexie.Table<HhEreignis, string>;
  public HhKonto: Dexie.Table<HhKonto, string>;
  public MaReplikation: Dexie.Table<MaReplikation, string>;
  public Parameter: Dexie.Table<Parameter, string>;
  public Sudoku: Dexie.Table<Sudoku, string>;
  public TbEintrag: Dexie.Table<TbEintrag, string>;

  constructor(private store: Store<AppState>) {
    super(DB_NAME);
    store.select('userId').subscribe(x => this.userId = x);
    this.version(1).stores({
      FzNotiz: '&uid,thema,replid',
      HhBuchung: '&uid,sollValuta,kz,ebetrag,sollKontoUid,habenKontoUid,btext,replid',
      MaReplikation: '&replikationUid,tabellenNr',
      Parameter: '&schluessel',
      TbEintrag: '&datum,eintrag,replid', // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.version(2).stores({
      FzNotiz: '&uid,thema,replid',
      HhBuchung: '&uid,sollValuta,kz,ebetrag,sollKontoUid,habenKontoUid,btext,replid',
      HhEreignis: '&uid,bezeichnung,etext,replid',
      HhKonto: '&uid,sortierung,name,replid',
      MaReplikation: '&replikationUid,tabellenNr',
      Parameter: '&schluessel',
      TbEintrag: '&datum,eintrag,replid', // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.version(3).stores({
      FzNotiz: '&uid,thema,replid',
      HhBuchung: '&uid,sollValuta,kz,ebetrag,sollKontoUid,habenKontoUid,btext,replid',
      HhEreignis: '&uid,bezeichnung,etext,replid',
      HhKonto: '&uid,sortierung,name,replid',
      MaReplikation: '&replikationUid,tabellenNr',
      Parameter: '&schluessel',
      Sudoku: '&schluessel', // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
      TbEintrag: '&datum,eintrag,replid', // ,angelegtAm,angelegtVon,geaendertAm,geaendertVon
    });
    this.FzNotiz = this.table('FzNotiz');
    this.HhBuchung = this.table('HhBuchung');
    this.HhEreignis = this.table('HhEreignis');
    this.HhKonto = this.table('HhKonto');
    this.MaReplikation = this.table('MaReplikation');
    this.Parameter = this.table('Parameter');
    this.Sudoku = this.table('Sudoku');
    this.TbEintrag = this.table('TbEintrag');

    //this.FzNotiz.put({uid: Global.getUID(), thema: 'Hallo', notiz: 'nix', angelegtAm: Global.now(), angelegtVon: 'abcd'});
    //this.FzNotiz.put({uid: Global.getUID(), thema: 'Hallo2', notiz: 'nix2', angelegtAm: Global.now(), angelegtVon: 'abcd'});
    //this.TbEintrag.put({datum: Global.date(26,9,2019), eintrag: 'Hallo', angelegtAm: Global.now(), angelegtVon: 'abc'});
    //this.TbEintrag.put({datum: Global.date(27,9,2019), eintrag: 'Hallo2', angelegtAm: Global.now(), angelegtVon: 'abc'});
    //this.HhBuchung.put({ uid: Global.getUID(), sollValuta: Global.date(13, 4, 2020), habenValuta: Global.date(13, 4, 2020), kz: 'A', betrag: 1.95583, ebetrag: 1, sollKontoUid: 'Soll', habenKontoUid: 'Haben', btext: 'Darum', belegDatum: Global.date(13, 4, 2020), belegNr: '1', angelegtAm: Global.now(), angelegtVon: 'abc' });
    //this.HhBuchung.put({ uid: Global.getUID(), sollValuta: Global.date(13, 4, 2020), habenValuta: Global.date(13, 4, 2020), kz: 'A', betrag: 1.95583, ebetrag: 1, sollKontoUid: 'Soll', habenKontoUid: 'Haben', btext: 'Darum', belegDatum: Global.date(13, 4, 2020), belegNr: '2', angelegtAm: Global.now(), angelegtVon: 'abc' });
  }
}
