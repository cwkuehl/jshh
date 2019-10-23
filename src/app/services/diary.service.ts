import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import Dexie from 'dexie';
import { Observable } from 'rxjs';
import * as TbEintragActions from '../actions/tbeintrag.actions';
import { Kontext, TbEintrag } from '../apis';
import { AppState } from '../app.state';
import { JshhDatabase } from '../components/database/database';
import { BaseService } from './base.service';
import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class DiaryService extends BaseService {

  constructor(store: Store<AppState>, db: JshhDatabase, http: HttpClient) {
    super(store, db, http);
  }

  getEintrag(datum: string): Dexie.Promise<TbEintrag> {

    if (datum == null) {
      return Dexie.Promise.resolve(null);
    }
    return Dexie.Promise.resolve(this.getTbEintrag(datum));
  }

  getTbEintrag(datum: string): Dexie.Promise<TbEintrag> {

    // console.log('getEintrag: ' + datum);
    // let l = this.db.TbEintrag.where('datum').equals(datum).first().finally(
    //  () => console.log('getEintrag finally'));
    let l = this.db.TbEintrag.get(datum); // .catch(e => console.log('Fehler: ' + e));
    return l;
  }

  getTbEintragListe(replidne: string): Dexie.Promise<TbEintrag[]> {

    let l = this.db.TbEintrag.where('replid').notEqual(replidne).toArray();
    return l;
  }

  iuTbEintrag(daten: Kontext, e: TbEintrag): Dexie.Promise<string> {

    if (daten == null || e == null) {
      return Dexie.Promise.reject('Parameter fehlt');
    }
      if (e.replid === 'new') {
        e.replid = Global.getUID();
      } else if (e.replid !== 'server') {
      if (e.angelegtAm == null) {
        e.angelegtAm = daten.jetzt;
        e.angelegtVon = daten.benutzerId;
      } else {
        e.geaendertAm = daten.jetzt;
        e.geaendertVon = daten.benutzerId;
      }
    }
    return this.db.TbEintrag.put(e);
  }

  public saveEntryOb(eintrag: TbEintrag): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveEntry(eintrag)
        .then(a => s.next(TbEintragActions.EmptyTbEintrag()))
        //.catch(e => s.error(e))
        .catch(e => s.next(TbEintragActions.ErrorTbEintrag(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public saveEntry(eintrag: TbEintrag): Dexie.Promise<TbEintrag> {

    let daten = this.getKontext();
    // console.log('DiaryService saveEntry: ' + daten.benutzerId);
    if (eintrag == null || eintrag.datum == null) {
      return Dexie.Promise.resolve(null);
    }
    // Korrektur aus Import vom Server
    if (eintrag.angelegtAm != null && typeof eintrag.angelegtAm == 'string') {
      let d = new Date(Date.parse(eintrag.angelegtAm));
      //d.setTime(d.getTime() - d.getTimezoneOffset()*60*1000);
      eintrag.angelegtAm = d;
    }
    if (eintrag.geaendertAm != null && typeof eintrag.geaendertAm == 'string') {
      eintrag.geaendertAm = new Date(Date.parse(eintrag.geaendertAm));
    }
    eintrag.eintrag = Global.trim(eintrag.eintrag);
    let leer = Global.nes(eintrag.eintrag);
    return this.getTbEintrag(eintrag.datum).then((tbEintrag: TbEintrag) => {
      if (tbEintrag == null) {
        if (!leer) {
          if (eintrag.replid !== 'server')
            eintrag.replid = Global.getUID();
          return this.iuTbEintrag(daten, eintrag).then(r => {
            return new Dexie.Promise<TbEintrag>((resolve) => { resolve(eintrag); })
          });
        }
      } else if (!leer) {
        let art = 0; // 0 überschreiben, 1 zusammenkopieren, 2 lassen
        if (eintrag.eintrag === tbEintrag.eintrag) {
          // tbEintrag.replid alt | eintrag.replid neu | Aktion
          // Guid                 | server             | replid = 'server', Revision übernehmen, damit nicht mehr an Server geschickt wird
          art = 2;
          if (tbEintrag.replid !== 'server') {
            if (eintrag.replid === 'server') {
              art = 0;
              tbEintrag.replid = 'server'; // neue Guid
              tbEintrag.angelegtAm = eintrag.angelegtAm;
              tbEintrag.angelegtVon = eintrag.angelegtVon;
              tbEintrag.geaendertAm = eintrag.geaendertAm;
              tbEintrag.geaendertVon = eintrag.geaendertVon;
            }
          }
        } else {
          // tbEintrag.replid alt | eintrag.replid neu | Aktion
          // server               | null               | neue Guid, Eintrag überschreiben
          // server               | server             | Eintrag überschreiben
          // Guid                 | null               | Eintrag überschreiben
          // Guid                 | server             | Wenn tbEintrag.angelegtAm != eintrag.angelegtAm, neue Guid, Einträge zusammenkopieren
          //                      |                    | Wenn tbEintrag.angelegtAm == eintrag.angelegtAm und tbEintrag.geaendertAm <= eintrag.geaendertAm, Eintrag überschreiben
          //                      |                    | Wenn tbEintrag.angelegtAm == eintrag.angelegtAm und (eintrag.geaendertAm == null oder tbEintrag.geaendertAm > eintrag.geaendertAm), Eintrag lassen
          if (tbEintrag.replid === 'server') {
            if (eintrag.replid !== 'server')
              tbEintrag.replid = Global.getUID(); // neue Guid
          } else if (eintrag.replid === 'server') {
            if (tbEintrag.angelegtAm != null && (eintrag.angelegtAm == null || tbEintrag.angelegtAm.getTime() != eintrag.angelegtAm.getTime())) {
              art = 1;
            } else if (tbEintrag.angelegtAm != null && eintrag.angelegtAm != null && tbEintrag.angelegtAm.getTime() == eintrag.angelegtAm.getTime()
                && tbEintrag.geaendertAm != null && (eintrag.geaendertAm == null || tbEintrag.geaendertAm.getTime() > eintrag.geaendertAm.getTime())) {
              art = 2;
            }
            if (art == 0) {
              tbEintrag.replid = eintrag.replid;
            }
          }
          if (art == 0) {
            tbEintrag.eintrag = eintrag.eintrag;
          } else if (art == 1) {
            let merge = `Server: ${eintrag.eintrag}\nLokal: ${tbEintrag.eintrag}`;
            tbEintrag.eintrag = merge;
            tbEintrag.replid = 'new';
            tbEintrag.angelegtAm = eintrag.angelegtAm;
            tbEintrag.angelegtVon = eintrag.angelegtVon;
            tbEintrag.geaendertAm = daten.jetzt;
            tbEintrag.geaendertVon = daten.benutzerId;
          }
          //return Dexie.Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuTbEintrag(daten, tbEintrag).then(r => {
            return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
          });
        }
    } else {
        // leeren Eintrag löschen
        //if (eintrag.datum == null)
        //  return Dexie.Promise.reject('Fehler beim Löschen.');
        return this.db.TbEintrag.delete(eintrag.datum).then(r => {
          return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
        });
      }
      return tbEintrag;
    }); // .catch((e) => console.log('speichereEintrag: ' + e));
  }

  public deleteAllOb(): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.db.TbEintrag.toCollection().delete()
        .then(a => s.next(TbEintragActions.EmptyTbEintrag()))
        //.catch(e => s.error(e))
        .catch(e => s.next(TbEintragActions.ErrorTbEintrag(e)))
        .finally(() => s.complete());
    });
    return ob;
  }
}
