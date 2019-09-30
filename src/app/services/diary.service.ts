import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import Dexie from 'dexie';
import { Observable, of } from 'rxjs';
import { Global } from '.';
import * as TbEintragActions from '../actions/tbeintrag.actions';
import { Kontext, TbEintrag } from '../apis';
import { JshhDatabase } from '../components/database/database';
import { BaseService } from './base.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DiaryService extends BaseService {

  constructor(db: JshhDatabase, private http: HttpClient) {
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

  public saveEntryOb(datum: Date, eintrag: string): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveEntry(datum, eintrag)
        .then(a => s.next(TbEintragActions.EmptyTbEintrag()))
        //.catch(e => s.error(e))
        .catch(e => s.next(TbEintragActions.ErrorTbEintrag(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public saveEntry(datum: Date, eintrag: string): Dexie.Promise<TbEintrag> {

    let daten = this.getKontext();
    // console.log('DiaryService saveEntry: ' + daten.benutzerId);
    if (datum == null) {
      return Dexie.Promise.resolve(null);
    }
    eintrag = Global.trim(eintrag);
    let leer = Global.nes(eintrag);
    //const x = await this.db.TbEintrag.get(datum);
    return this.getTbEintrag(datum).then((tbEintrag: TbEintrag) => {
      // console.log('Then: ' + tbEintrag);
      if (tbEintrag == null) {
        if (!leer) {
          tbEintrag = { datum: datum, eintrag: eintrag, angelegtAm: null, angelegtVon: null, geaendertAm: null, geaendertVon: null };
          //this.iuTbEintrag(daten, tbEintrag);
          return this.iuTbEintrag(daten, tbEintrag).then(r => {
            return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
          });
        }
      } else if (!leer) {
        if (eintrag !== tbEintrag.eintrag) {
          tbEintrag.eintrag = eintrag;
          //return Dexie.Promise.reject('Fehler beim Ändern.');
          //this.iuTbEintrag(daten, tbEintrag);
          return this.iuTbEintrag(daten, tbEintrag).then(r => {
            return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
          });
        }
      } else {
        // leeren Eintrag löschen
        if (datum == null)
          return Dexie.Promise.reject('Fehler beim Löschen.');
        return this.db.TbEintrag.delete(datum).then(r => {
          return new Dexie.Promise<TbEintrag>((resolve) => { resolve(tbEintrag); })
        });
        //this.deleteTbEintrag(daten, datum);
      }
      return tbEintrag;
    }); // .catch((e) => console.log('speichereEintrag: ' + e));
  }

  find(): Observable<any> {
    //let url = 'http://www.angular.at/api/flight'; // OK
    let url = 'http://127.0.0.1:4201/aaa';
    //let url = '/favicon.ico';
    let headers = new HttpHeaders().set('Accept', 'application/json');
    let params = {
        'table': 'TB_Eintrag',
    };
    //return this.http.get(url, {params, headers});
    return this.http.get(url);
  }
}
