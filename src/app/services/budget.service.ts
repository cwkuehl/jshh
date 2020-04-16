import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import Dexie from 'dexie';
import { FzNotiz, Kontext, HhBuchung } from '../apis';
import { AppState } from '../app.state';
import { JshhDatabase } from './database';
import { BaseService } from './base.service';
import { Global } from './global';
import * as GlobalActions from '../actions/global.actions';
import * as HhBuchungActions from '../actions/hhbuchung.actions';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BudgetService extends BaseService {

  constructor(store: Store<AppState>, db: JshhDatabase, http: HttpClient) {
    super(store, db, http);
  }

  getBookingList(replidne: string): Dexie.Promise<HhBuchung[]> {

    if (Global.nes(replidne))
      return this.db.HhBuchung.toArray();
    else
      return this.db.HhBuchung.where('replid').notEqual(replidne).toArray();
  }

  getBooking(uid: string): Dexie.Promise<HhBuchung> {
    let l = this.db.HhBuchung.get(uid);
    return l;
  }

  private iuHhBuchung(daten: Kontext, e: HhBuchung): Dexie.Promise<string> {
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
    return this.db.HhBuchung.put(e);
  }

  public saveBookingOb(e: HhBuchung): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveBooking(e)
        .then(a => s.next(HhBuchungActions.Empty()))
        .catch(ex => s.next(GlobalActions.SetError(ex)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public saveBooking(e0: HhBuchung): Dexie.Promise<HhBuchung> {
    if (e0 == null) {
      return Dexie.Promise.resolve(null);
    }
    var e = Object.assign({}, e0); // Clone erzeugen
    let daten = this.getKontext();
    // Korrektur aus Import vom Server
    if (e.sollValuta != null && typeof e.sollValuta == 'string')
      e.sollValuta = new Date(Date.parse(e.sollValuta));
    if (e.habenValuta != null && typeof e.habenValuta == 'string')
      e.habenValuta = new Date(Date.parse(e.habenValuta));
    if (e.betrag != null && typeof e.betrag == 'string') {
      var b = Number((<string>e.betrag).replace(',', ''));
      e.betrag = b;
    }
    if (e.ebetrag != null && typeof e.ebetrag == 'string')
      e.ebetrag = Number((<string>e.ebetrag).replace(',', ''));
    if (e.belegDatum != null && typeof e.belegDatum == 'string')
      e.belegDatum = new Date(Date.parse(e.belegDatum));
    if (e.angelegtAm != null && typeof e.angelegtAm == 'string')
      e.angelegtAm = new Date(Date.parse(e.angelegtAm));
    if (e.geaendertAm != null && typeof e.geaendertAm == 'string')
      e.geaendertAm = new Date(Date.parse(e.geaendertAm));
    if (Global.nes(e.uid))
      e.uid = Global.getUID();
    e.btext = Global.trim(e.btext);
    e.belegNr = Global.trimNull(e.belegNr);
    if (Global.nes(e.btext))
      return Dexie.Promise.reject('Buchungstext fehlt');
    if (Global.nes(e.sollKontoUid))
      return Dexie.Promise.reject('Sollkonto fehlt');
    if (Global.nes(e.habenKontoUid))
      return Dexie.Promise.reject('Habenkonto fehlt');

    return this.getBooking(e.uid).then((alt: HhBuchung) => {
      if (alt == null) {
        if (e.replid !== 'server')
          e.replid = Global.getUID();
        return this.iuHhBuchung(daten, e).then(r => {
          return new Dexie.Promise<HhBuchung>(resolve => resolve(e))
        });
      } else {
        let art = 0; // 0 überschreiben, (1 zusammenkopieren,) 2 lassen
        if (e.sollValuta === alt.sollValuta && e.kz === alt.kz && e.betrag === alt.betrag
          && e.ebetrag === alt.ebetrag && e.sollKontoUid === alt.sollKontoUid
          && e.habenKontoUid === alt.habenKontoUid && e.btext === alt.btext
          && e.belegNr === alt.belegNr && e.belegDatum === alt.belegDatum) {
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
          // Guid           | server       | Eintrag überschreiben
          if (alt.replid === 'server') {
            if (e.replid !== 'server')
              alt.replid = Global.getUID(); // neue Guid
          } else if (e.replid === 'server') {
            alt.replid = e.replid;
          }
          if (art == 0) {
            alt.sollValuta = e.sollValuta;
            alt.habenValuta = e.habenValuta;
            alt.kz = e.kz;
            alt.betrag = e.betrag;
            alt.ebetrag = e.ebetrag;
            alt.sollKontoUid = e.sollKontoUid;
            alt.habenKontoUid = e.habenKontoUid;
            alt.btext = e.btext;
            alt.belegNr = e.belegNr;
            alt.belegDatum = e.belegDatum;
          }
          //return Dexie.Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuHhBuchung(daten, alt).then(r => {
            return new Dexie.Promise<HhBuchung>(resolve => resolve(alt))
          });
        }
      }
      return alt;
    }); // .catch((ex) => console.log('speichereEintrag: ' + ex));
  }

  public deleteAllBookingsOb(): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.db.HhBuchung.toCollection().delete()
        .then(a => s.next(HhBuchungActions.Empty()))
        .catch(ex => s.next(GlobalActions.SetError(ex)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public postServer(arr: HhBuchung[]): void {
    let jarr = JSON.stringify({ 'HH_Buchung': arr });
    this.postReadServer<HhBuchung[]>('HH_Buchung', jarr).subscribe(
      (a: HhBuchung[]) => {
        a.reverse().forEach((e: HhBuchung) => {
          this.store.dispatch(HhBuchungActions.Save({ booking: e }));
          this.store.dispatch(HhBuchungActions.Load());
        });
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(GlobalActions.SetError(Global.handleError(err)));
      },
    );
  }
}
