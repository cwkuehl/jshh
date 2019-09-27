import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { JshhDatabase } from '../components/database/database';
import { Observable, from, of, range } from 'rxjs';
import { TbEintrag, Kontext } from '../apis';
import { Global } from '.';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DiaryService extends BaseService {

  constructor(db: JshhDatabase) {
    super(db);
  }

  getEintrag(datum: Date): Dexie.Promise<TbEintrag> {

    if (datum == null) {
      return Dexie.Promise.resolve(null);
    }
    return Dexie.Promise.resolve(this.getTbEintrag(datum));
  }

  getTbEintrag(datum: Date): Dexie.Promise<TbEintrag> {

    // console.log('getEintrag: ' + datum);
    // let l = this.db.TbEintrag.where('datum').equals(datum).first().finally(
    //  () => console.log('getEintrag finally'));
    let l = this.db.TbEintrag.get(datum); // .catch(e => console.log('Fehler: ' + e));
    return l;
  }

  iuTbEintrag(daten: Kontext, e: TbEintrag): Dexie.Promise<Date> {

    if (daten == null || e == null) {
      return Dexie.Promise.reject('Parameter fehlt');
    }
    if (e.angelegtAm == null) {
      e.angelegtAm = daten.jetzt;
      e.angelegtVon = daten.benutzerId;
    } else {
      e.geaendertAm = daten.jetzt;
      e.geaendertVon = daten.benutzerId;
    }
    return this.db.TbEintrag.put(e);
  }

  deleteTbEintrag(daten: Kontext, e: Date): Dexie.Promise<void> {

    if (daten == null || e == null) {
      return Dexie.Promise.reject('Parameter fehlt');
    }
    return this.db.TbEintrag.delete(e);
  }

  public saveEntry(datum: Date, eintrag: string): Dexie.Promise<TbEintrag> {

    let daten = this.getKontext();
    // console.log('DiaryService saveEntry: ' + daten.benutzerId);
    if (datum == null) {
      return Dexie.Promise.resolve(null);
    }
    eintrag = Global.trim(eintrag);
    let leer = Global.nes(eintrag);
    return this.getTbEintrag(datum).then((tbEintrag: TbEintrag) => {
      // console.log('Then: ' + tbEintrag);
      if (tbEintrag == null) {
        if (!leer) {
          tbEintrag = { datum: datum, eintrag: eintrag, angelegtAm: null, angelegtVon: null, geaendertAm: null, geaendertVon: null };
          this.iuTbEintrag(daten, tbEintrag);
        }
      } else if (!leer) {
        if (eintrag !== tbEintrag.eintrag) {
          tbEintrag.eintrag = eintrag;
          //return Dexie.Promise.reject('Fehler beim Ändern.');
          this.iuTbEintrag(daten, tbEintrag);
        }
      } else {
        // leeren Eintrag löschen
        this.deleteTbEintrag(daten, datum);
      }
      return tbEintrag;
    }); // .catch((e) => console.log('speichereEintrag: ' + e));
  }

  load(): Observable<TbEintrag> {
    return of({datum: Global.today(), eintrag: 'Hallo', angelegtAm: Global.now(), angelegtVon: 'abc'});
  }
}
