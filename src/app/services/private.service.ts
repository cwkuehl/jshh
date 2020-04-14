import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import Dexie from 'dexie';
import { FzNotiz, Kontext } from '../apis';
import { AppState } from '../app.state';
import { JshhDatabase } from './database';
import { BaseService } from './base.service';
import { Global } from './global';
import * as GlobalActions from '../actions/global.actions';
import * as FzNotizActions from '../actions/fznotiz.actions'
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PrivateService extends BaseService {

  constructor(store: Store<AppState>, db: JshhDatabase, http: HttpClient) {
    super(store, db, http);
  }

  // memos: FzNotiz[] = [];

  getMemoList(replidne: string): Dexie.Promise<FzNotiz[]> {

    if (Global.nes(replidne))
      return this.db.FzNotiz.toArray();
    else
      return this.db.FzNotiz.where('replid').notEqual(replidne).toArray();
  }

  getMemo(uid: string): Dexie.Promise<FzNotiz> {
    let l = this.db.FzNotiz.get(uid);
    return l;
  }

  // public loadMemos(): void {
  //   this.getMemoList(null).then(l => { if (l != null) this.memos = l; })
  //     .catch(e => this.store.dispatch(GlobalActions.SetError(e)));
  // }

  private iuFzNotiz(daten: Kontext, e: FzNotiz): Dexie.Promise<string> {
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
    return this.db.FzNotiz.put(e);
  }

  public saveMemoOb(eintrag: FzNotiz): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveMemo(eintrag)
        .then(a => s.next(FzNotizActions.Empty()))
        .catch(e => s.next(GlobalActions.SetError(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public saveMemo(e0: FzNotiz): Dexie.Promise<FzNotiz> {
    var e = Object.assign({}, e0); // Clone erzeugen
    let daten = this.getKontext();
    // console.log('DiaryService saveEntry: ' + daten.benutzerId);
    if (e == null || e.uid == null) {
      return Dexie.Promise.resolve(null);
    }
    // Korrektur aus Import vom Server
    if (e.angelegtAm != null && typeof e.angelegtAm == 'string') {
      let d = new Date(Date.parse(e.angelegtAm));
      //d.setTime(d.getTime() - d.getTimezoneOffset()*60*1000);
      e.angelegtAm = d;
    }
    if (e.geaendertAm != null && typeof e.geaendertAm == 'string') {
      e.geaendertAm = new Date(Date.parse(e.geaendertAm));
    }
    e.notiz = Global.trim(e.notiz);
    return this.getMemo(e.uid).then((tbEintrag: FzNotiz) => {
      if (tbEintrag == null) {
        if (e.replid !== 'server')
          e.replid = Global.getUID();
        return this.iuFzNotiz(daten, e).then(r => {
          return new Dexie.Promise<FzNotiz>(resolve => resolve(e))
        });
      } else {
        let art = 0; // 0 überschreiben, 1 zusammenkopieren, 2 lassen
        if (e.thema === tbEintrag.thema && e.notiz === tbEintrag.notiz) {
          // tbEintrag.replid alt | eintrag.replid neu | Aktion
          // Guid                 | server             | replid = 'server', Revision übernehmen, damit nicht mehr an Server geschickt wird
          art = 2;
          if (tbEintrag.replid !== 'server') {
            if (e.replid === 'server') {
              art = 0;
              tbEintrag.replid = 'server'; // neue Guid
              tbEintrag.angelegtAm = e.angelegtAm;
              tbEintrag.angelegtVon = e.angelegtVon;
              tbEintrag.geaendertAm = e.geaendertAm;
              tbEintrag.geaendertVon = e.geaendertVon;
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
            if (e.replid !== 'server')
              tbEintrag.replid = Global.getUID(); // neue Guid
          } else if (e.replid === 'server') {
            if (tbEintrag.angelegtAm != null && (e.angelegtAm == null || tbEintrag.angelegtAm.getTime() != e.angelegtAm.getTime())) {
              art = 1;
            } else if (tbEintrag.angelegtAm != null && e.angelegtAm != null && tbEintrag.angelegtAm.getTime() == e.angelegtAm.getTime()
              && tbEintrag.geaendertAm != null && (e.geaendertAm == null || tbEintrag.geaendertAm.getTime() > e.geaendertAm.getTime())) {
              art = 2;
            }
            if (art == 0) {
              tbEintrag.replid = e.replid;
            }
          }
          if (art == 0) {
            tbEintrag.thema = e.thema;
            tbEintrag.notiz = e.notiz;
          } else if (art == 1) {
            tbEintrag.thema = e.thema;
            let merge = `Server: ${e.notiz}\nLokal: ${tbEintrag.notiz}`;
            tbEintrag.notiz = merge;
            tbEintrag.replid = 'new';
            tbEintrag.angelegtAm = e.angelegtAm;
            tbEintrag.angelegtVon = e.angelegtVon;
            tbEintrag.geaendertAm = daten.jetzt;
            tbEintrag.geaendertVon = daten.benutzerId;
          }
          //return Dexie.Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuFzNotiz(daten, tbEintrag).then(r => {
            return new Dexie.Promise<FzNotiz>(resolve => resolve(tbEintrag))
          });
        }
      }
      return tbEintrag;
    }); // .catch((ex) => console.log('speichereEintrag: ' + ex));
  }

  public deleteAllMemosOb(): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.db.FzNotiz.toCollection().delete()
        .then(a => s.next(FzNotizActions.Empty()))
        .catch(e => s.next(GlobalActions.SetError(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public postServer(arr: FzNotiz[]) {
    let jarr = JSON.stringify({ 'FZ_Notiz': arr });
    this.postReadServer<FzNotiz[]>('FZ_Notiz', jarr).subscribe(
      (a: FzNotiz[]) => {
        a.reverse().forEach((e: FzNotiz) => {
          this.store.dispatch(FzNotizActions.Save(e));
          this.store.dispatch(FzNotizActions.Load());
        });
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(GlobalActions.SetError(Global.handleError(err)));
      },
    );
  }
}
