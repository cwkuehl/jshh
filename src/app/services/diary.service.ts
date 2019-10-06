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

  iuTbEintrag(daten: Kontext, e: TbEintrag): Dexie.Promise<string> {

    if (daten == null || e == null) {
      return Dexie.Promise.reject('Parameter fehlt');
    }
    if (e.angelegtAm !== null && typeof e.angelegtAm == 'string')
      e.angelegtAm = new Date(Date.parse(e.angelegtAm));
    if (e.geaendertAm !== null && typeof e.geaendertAm == 'string')
      e.geaendertAm = new Date(Date.parse(e.geaendertAm));
    if (e.replid == null || e.replid != 'server') {
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
    eintrag.eintrag = Global.trim(eintrag.eintrag);
    let leer = Global.nes(eintrag.eintrag);
    return this.getTbEintrag(eintrag.datum).then((tbEintrag: TbEintrag) => {
      // console.log('Then: ' + tbEintrag);
      if (tbEintrag == null) {
        if (!leer) {
          return this.iuTbEintrag(daten, eintrag).then(r => {
            return new Dexie.Promise<TbEintrag>((resolve) => { resolve(eintrag); })
          });
        }
      } else if (!leer) {
        if (eintrag.eintrag !== tbEintrag.eintrag) {
          tbEintrag.eintrag = eintrag.eintrag;
          tbEintrag.replid = eintrag.replid;
          //return Dexie.Promise.reject('Fehler beim Ändern.');
          return this.iuTbEintrag(daten, tbEintrag).then(r => {
            return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
          });
        }
      } else {
        // leeren Eintrag löschen
        if (eintrag.datum == null)
          return Dexie.Promise.reject('Fehler beim Löschen.');
        return this.db.TbEintrag.delete(eintrag.datum).then(r => {
          return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
        });
      }
      return tbEintrag;
    }); // .catch((e) => console.log('speichereEintrag: ' + e));
  }

  postServer<T>(table: string, mode: string): Observable<T> {

    let url = this.replicationServer;
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      //'Authorization': 'my-auth-token'
    }); // ().set('Accept', 'application/json');
    let params = {
      'table': table,
      'mode': mode,
    };
    let daten = this.getKontext();
    return this.http.post<T>(url, daten.benutzerId, { reportProgress: false, params, headers });
  }
}
