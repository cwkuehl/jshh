import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as TbEintragActions from '../actions/tbeintrag.actions';
import { Kontext, TbEintrag } from '../apis';
import { AppState } from '../app.state';
import { JshhDatabase } from './database';
import { BaseService } from './base.service';
import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class DiaryService extends BaseService {

  constructor(store: Store<AppState>, db: JshhDatabase, http: HttpClient) {
    super(store, db, http);
  }

  getEintrag(datum: string): Promise<TbEintrag> {

    if (datum == null) {
      return Promise.resolve(null);
    }
    return Promise.resolve(this.getTbEintrag(datum));
  }

  getTbEintrag(datum: string): Promise<TbEintrag> {

    // console.log('getEintrag: ' + datum);
    // let l = this.db.TbEintrag.where('datum').equals(datum).first().finally(
    //  () => console.log('getEintrag finally'));
    let l = this.db.TbEintrag.get(datum); // .catch(e => console.log('Fehler: ' + e));
    return l;
  }

  getTbEintragListe(replidne: string): Promise<TbEintrag[]> {

    let l = this.db.TbEintrag.where('replid').notEqual(replidne).toArray();
    return l;
  }

  iuTbEintrag(daten: Kontext, e: TbEintrag): Promise<string> {

    if (daten == null || e == null) {
      return Promise.reject('Parameter fehlt');
    }
    this.iuRevision(daten, e);
    return this.db.TbEintrag.put(e);
  }

  public saveEntryOb(eintrag: TbEintrag): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveEntry(eintrag)
        .then(a => s.next(TbEintragActions.Empty()))
        //.catch(e => s.error(e))
        .catch(e => s.next(TbEintragActions.Error(e)))
      //.finally(() => s.complete());
    });
    return ob;
  }

  public saveEntry(eintrag0: TbEintrag): Promise<TbEintrag> {
    if (eintrag0 == null || eintrag0.datum == null) {
      return Promise.resolve(null);
    }
    var eintrag = Object.assign({}, eintrag0); // Clone erzeugen
    let daten = this.getKontext();
    // console.log('DiaryService saveEntry: ' + daten.benutzerId);
    // Korrektur aus Import vom Server
    if (eintrag.angelegtAm != null && typeof eintrag.angelegtAm == 'string') {
      eintrag.angelegtAm = new Date(Date.parse(eintrag.angelegtAm));
    }
    if (eintrag.geaendertAm != null && typeof eintrag.geaendertAm == 'string') {
      eintrag.geaendertAm = new Date(Date.parse(eintrag.geaendertAm));
    }
    eintrag.eintrag = Global.trim(eintrag.eintrag);
    let leer = Global.nes(eintrag.eintrag);
    return this.getTbEintrag(eintrag.datum).then((alt: TbEintrag) => {
      if (alt == null) {
        if (!leer) {
          if (eintrag.replid !== 'server')
            eintrag.replid = Global.getUID();
          return this.iuTbEintrag(daten, eintrag).then(r => {
            return new Promise<TbEintrag>(resolve => resolve(eintrag))
          });
        }
      } else if (!leer) {
        let art = 0; // 0 überschreiben, 1 zusammenkopieren, 2 lassen
        if (eintrag.eintrag === alt.eintrag) {
          // alt.replid alt | eintrag.replid neu | Aktion
          // Guid           | server             | replid = 'server', Revision übernehmen, damit nicht mehr an Server geschickt wird
          art = 2;
          if (alt.replid !== 'server') {
            if (eintrag.replid === 'server') {
              art = 0;
              alt.replid = 'server'; // neue Guid
              alt.angelegtAm = eintrag.angelegtAm;
              alt.angelegtVon = eintrag.angelegtVon;
              alt.geaendertAm = eintrag.geaendertAm;
              alt.geaendertVon = eintrag.geaendertVon;
            }
          }
        } else {
          // alt.replid alt | eintrag.replid neu | Aktion
          // server         | null               | neue Guid, Eintrag überschreiben
          // server         | server             | Eintrag überschreiben
          // Guid           | null               | Eintrag überschreiben
          // Guid           | server             | Wenn alt.angelegtAm != eintrag.angelegtAm, neue Guid, Einträge zusammenkopieren
          //                |                    | Wenn alt.angelegtAm == eintrag.angelegtAm und alt.geaendertAm <= eintrag.geaendertAm, Eintrag überschreiben
          //                |                    | Wenn alt.angelegtAm == eintrag.angelegtAm und (eintrag.geaendertAm == null oder alt.geaendertAm > eintrag.geaendertAm), Eintrag lassen
          if (alt.replid === 'server') {
            if (eintrag.replid !== 'server')
              alt.replid = Global.getUID(); // neue Guid
          } else if (eintrag.replid === 'server') {
            if (alt.angelegtAm != null && (eintrag.angelegtAm == null || alt.angelegtAm.getTime() != eintrag.angelegtAm.getTime())) {
              art = 1;
            } else if (alt.angelegtAm != null && eintrag.angelegtAm != null && alt.angelegtAm.getTime() == eintrag.angelegtAm.getTime()
              && alt.geaendertAm != null && (eintrag.geaendertAm == null || alt.geaendertAm.getTime() > eintrag.geaendertAm.getTime())) {
              art = 2;
            }
            if (art == 0) {
              alt.replid = eintrag.replid;
            }
          }
          if (art == 0) {
            alt.eintrag = eintrag.eintrag;
          } else if (art == 1) {
            let merge = `Server: ${eintrag.eintrag}\nLokal: ${alt.eintrag}`;
            alt.eintrag = merge;
            alt.replid = 'new';
            alt.angelegtAm = eintrag.angelegtAm;
            alt.angelegtVon = eintrag.angelegtVon;
            alt.geaendertAm = daten.jetzt;
            alt.geaendertVon = daten.benutzerId;
          }
          //return Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuTbEintrag(daten, alt).then(r => {
            return new Promise<TbEintrag>(resolve => resolve(alt))
          });
        }
      } else {
        // leeren Eintrag löschen
        //if (eintrag.datum == null)
        //  return Promise.reject('Fehler beim Löschen.');
        return this.db.TbEintrag.delete(eintrag.datum).then(r => {
          return new Promise<TbEintrag>(resolve => resolve(alt))
        });
      }
      return alt;
    }); // .catch((e) => console.log('speichereEintrag: ' + e));
  }

  public deleteAllOb(): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.db.TbEintrag.toCollection().delete()
        .then(a => s.next(TbEintragActions.Empty()))
        //.catch(e => s.error(e))
        .catch(e => s.next(TbEintragActions.Error(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

  postServer(arr: TbEintrag[]) {
    let jarr = JSON.stringify({ 'TB_Eintrag': arr });
    this.postReadServer<TbEintrag[]>('TB_Eintrag', jarr).subscribe(
      (a: TbEintrag[]) => {
        a.reverse().forEach((e: TbEintrag) => {
          //console.log(e.datum + ": " + e.eintrag);
          this.store.dispatch(TbEintragActions.Save(e));
          this.store.dispatch(TbEintragActions.Load());
        });
        //console.log("JSON Next: " + JSON.stringify(a));
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(TbEintragActions.Error(Global.handleError(err)));
      },
      //() => this.store.dispatch(TbEintragActions.Load())
    );
  }
}
