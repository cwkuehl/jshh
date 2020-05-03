import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
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

  getMemoList(replidne: string): Promise<FzNotiz[]> {

    if (Global.nes(replidne))
      return this.db.FzNotiz.toArray();
    else
      return this.db.FzNotiz.where('replid').notEqual(replidne).toArray();
  }

  getMemo(uid: string): Promise<FzNotiz> {
    let l = this.db.FzNotiz.get(uid);
    return l;
  }

  // public loadMemos(): void {
  //   this.getMemoList(null).then(l => { if (l != null) this.memos = l; })
  //     .catch(e => this.store.dispatch(GlobalActions.SetError(e)));
  // }

  private iuFzNotiz(daten: Kontext, e: FzNotiz): Promise<string> {
    if (daten == null || e == null) {
      return Promise.reject('Parameter fehlt');
    }
    this.iuRevision(daten, e);
    return this.db.FzNotiz.put(e);
  }

  public saveMemoOb(eintrag: FzNotiz): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveMemo(eintrag)
        .then(a => s.next(FzNotizActions.Empty()))
        .catch(e => s.next(GlobalActions.SetError(e)))
      //.finally(() => s.complete());
    });
    return ob;
  }

  public saveMemo(e0: FzNotiz): Promise<FzNotiz> {
    if (e0 == null || e0.uid == null) {
      return Promise.resolve(null);
    }
    var e = Object.assign({}, e0); // Clone erzeugen
    let daten = this.getKontext();
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
    return this.getMemo(e.uid).then((alt: FzNotiz) => {
      if (alt == null) {
        if (e.replid !== 'server')
          e.replid = Global.getUID();
        return this.iuFzNotiz(daten, e).then(r => {
          return new Promise<FzNotiz>(resolve => resolve(e))
        });
      } else {
        let art = 0; // 0 überschreiben, 1 zusammenkopieren, 2 lassen
        if (e.thema === alt.thema && e.notiz === alt.notiz) {
          // alt.replid alt | e.replid neu | Aktion
          // Guid           | server       | replid = 'server', Revision übernehmen, damit nicht mehr an Server geschickt wird
          art = 2;
          if (alt.replid !== 'server') {
            if (e.replid === 'server') {
              art = 0;
              alt.replid = 'server'; // neue Guid
              alt.angelegtAm = e.angelegtAm;
              alt.angelegtVon = e.angelegtVon;
              alt.geaendertAm = e.geaendertAm;
              alt.geaendertVon = e.geaendertVon;
            }
          }
        } else {
          // alt.replid alt | e.replid neu | Aktion
          // server         | null         | neue Guid, Eintrag überschreiben
          // server         | server       | Eintrag überschreiben
          // Guid           | null         | Eintrag überschreiben
          // Guid           | server       | Wenn alt.angelegtAm != e.angelegtAm, neue Guid, Einträge zusammenkopieren
          //                |              | Wenn alt.angelegtAm == e.angelegtAm und alt.geaendertAm <= e.geaendertAm, Eintrag überschreiben
          //                |              | Wenn alt.angelegtAm == e.angelegtAm und (e.geaendertAm == null oder alt.geaendertAm > e.geaendertAm), Eintrag lassen
          if (alt.replid === 'server') {
            if (e.replid !== 'server')
              alt.replid = Global.getUID(); // neue Guid
          } else if (e.replid === 'server') {
            if (alt.angelegtAm != null && (e.angelegtAm == null || alt.angelegtAm.getTime() != e.angelegtAm.getTime())) {
              art = 1;
            } else if (alt.angelegtAm != null && e.angelegtAm != null && alt.angelegtAm.getTime() == e.angelegtAm.getTime()
              && alt.geaendertAm != null && (e.geaendertAm == null || alt.geaendertAm.getTime() > e.geaendertAm.getTime())) {
              art = 2;
            }
            if (art == 0) {
              alt.replid = e.replid;
            }
          }
          if (art == 0) {
            alt.thema = e.thema;
            alt.notiz = e.notiz;
          } else if (art == 1) {
            alt.thema = e.thema;
            let merge = `Server: ${e.notiz}\nLokal: ${alt.notiz}`;
            alt.notiz = merge;
            alt.replid = 'new';
            alt.angelegtAm = e.angelegtAm;
            alt.angelegtVon = e.angelegtVon;
            alt.geaendertAm = daten.jetzt;
            alt.geaendertVon = daten.benutzerId;
          }
          //return Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuFzNotiz(daten, alt).then(r => {
            return new Promise<FzNotiz>(resolve => resolve(alt))
          });
        }
      }
      return alt;
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
