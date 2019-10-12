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

  replicationServer: string;

  constructor(private store: Store<AppState>, db: JshhDatabase, private http: HttpClient) {
    super(db);
    store.select('replicationServer').subscribe(a => this.replicationServer = a);
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
    if (e.replid !== 'server') {
      //if (e.replid == null)
      //  e.replid = Global.getUID();
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
    if (eintrag.angelegtAm !== null && typeof eintrag.angelegtAm == 'string')
      eintrag.angelegtAm = new Date(Date.parse(eintrag.angelegtAm));
    if (eintrag.geaendertAm !== null && typeof eintrag.geaendertAm == 'string')
      eintrag.geaendertAm = new Date(Date.parse(eintrag.geaendertAm));
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
        // tbEintrag.replid alt | eintrag.replid neu | Aktion
        // server               | null               | neue Guid, Eintrag überschreiben
        // server               | server             | Eintrag überschreiben
        // Guid                 | null               | Eintrag überschreiben
        // Guid                 | server             | Wenn tbEintrag.angelegtAm != eintrag.angelegtAm, Einträge zusammenkopieren
        //                      |                    | Wenn tbEintrag.angelegtAm == eintrag.angelegtAm und tbEintrag.geaendertAm <= eintrag.geaendertAm, Eintrag überschreiben
        //                      |                    | Wenn tbEintrag.angelegtAm == eintrag.angelegtAm und (eintrag.geaendertAm == null oder tbEintrag.geaendertAm > eintrag.geaendertAm), Eintrag lassen
        if (eintrag.eintrag !== tbEintrag.eintrag) {
          let art = 0; // 0 überschreiben, 1 zusammenkopieren, 2 lassen
          if (tbEintrag.replid === 'server') {
            if (eintrag.replid !== 'server')
              tbEintrag.replid = Global.getUID(); // neue Guid
          } else if (eintrag.replid === 'server') {
            if (tbEintrag.angelegtAm != null && (eintrag.angelegtAm == null || tbEintrag.angelegtAm.getTime() != eintrag.angelegtAm.getTime())) {
              art = 1;
            }
            if (tbEintrag.angelegtAm != null && eintrag.angelegtAm != null && tbEintrag.angelegtAm.getTime() == eintrag.angelegtAm.getTime()
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
            let merge = `Lokal: ${tbEintrag.eintrag}\nServer: ${eintrag.eintrag}`;
            tbEintrag.eintrag = merge;
          }
          //return Dexie.Promise.reject('Fehler beim Ändern.');
          if (art != 2) {
            return this.iuTbEintrag(daten, tbEintrag).then(r => {
              return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
            });
          }
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

  postServer<T>(table: string, mode: string): Observable<T> {

    let url = this.replicationServer;
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      //'Authorization': 'my-auth-token'
    }); // ().set('Accept', 'application/json');
    // let params = {
    //   'table': table,
    //   'mode': mode,
    // };
    let daten = this.getKontext();
    let body = JSON.stringify({
      'token': daten.benutzerId,
      'table': table,
      'mode': mode,
    });
    return this.http.post<T>(url, body, { reportProgress: false, /* params, */headers });
  }
}
