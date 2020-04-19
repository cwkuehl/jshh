import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import Dexie from 'dexie';
import { Kontext, HhBuchung, HhKonto } from '../apis';
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

  getBookingList(replidne: string): Promise<HhBuchung[]> {
    if (Global.nes(replidne)) {
      return this.db.HhBuchung.orderBy('sollValuta').reverse().toArray();
    } else
      return this.db.HhBuchung.where('replid').notEqual(replidne).reverse().sortBy('sollValuta');
  }

  async getBookingListJoin(replidne: string): Promise<HhBuchung[]> {
    const list = await this.getBookingList(replidne);
    await Promise.all(list.map(async a => {
      [a.sollKontoName, a.habenKontoName] = await Promise.all([
        this.db.HhKonto.get(a.sollKontoUid).then(b => { return b == null ? "soll" : b.name; }),
        this.db.HhKonto.get(a.habenKontoUid).then(b => { return b == null ? "haben" : b.name; })
      ]);
    }));
    return list;
  }

  /**
   * Lesen einer Buchung.
   * @param uid Betroffene ID.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  getBooking(uid: string): Dexie.Promise<HhBuchung> {
    let l = this.db.HhBuchung.get(uid);
    return l;
  }

  /**
   * Schreiben einer Buchung mit Anpassung der Revisionsdaten.
   * @param daten Betroffener Kontext.
   * @param e Betroffene Entity.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
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

  /**
   * Speichern einer Buchung.
   * @param e Betroffene Buchung.
   * @returns Eine Observable zur weiteren Verarbeitung.
   */
  public saveBookingOb(e: HhBuchung): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveBooking(e)
        .then(a => s.next(HhBuchungActions.Empty()))
        .catch(ex => s.next(GlobalActions.SetError(ex)))
        .finally(() => s.complete());
    });
    return ob;
  }

  /**
   * Speichern einer Buchung.
   * @param e Betroffene Buchung.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
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

  /**
   * Löschen aller Buchungen, Ereignisse und Konten.
   */
  public deleteAllBookingsOb(): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.db.transaction('rw', this.db.HhBuchung, this.db.HhEreignis, this.db.HhKonto, async () => {
        await this.db.HhBuchung.toCollection().delete();
        await this.db.HhEreignis.toCollection().delete();
        await this.db.HhKonto.toCollection().delete();
      })
        .then(a => s.next(HhBuchungActions.Empty()))
        .catch(ex => s.next(GlobalActions.SetError(ex)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public postServerBooking(arr: HhBuchung[]): void {
    let jarr = JSON.stringify({ 'HH_Buchung': arr });
    this.postReadServer<HhBuchung[]>('HH_Buchung', jarr).subscribe(
      (a: HhBuchung[]) => {
        a.forEach((e: HhBuchung) => {
          this.store.dispatch(HhBuchungActions.Save({ booking: e }));
          this.store.dispatch(HhBuchungActions.Load());
        });
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(GlobalActions.SetError(Global.handleError(err)));
      },
    );
  }

  getAccountList(replidne: string): Promise<HhKonto[]> {
    if (Global.nes(replidne)) {
      return this.db.HhKonto.orderBy('name').toArray();
    } else
      return this.db.HhKonto.where('replid').notEqual(replidne).sortBy('name');
  }

  /**
   * Lesen eines Kontos.
   * @param uid Betroffene ID.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  getAccount(uid: string): Dexie.Promise<HhKonto> {
    let l = this.db.HhKonto.get(uid);
    return l;
  }

  /**
   * Schreiben eines Kontos mit Anpassung der Revisionsdaten.
   * @param daten Betroffener Kontext.
   * @param e Betroffene Entity.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  private iuHhKonto(daten: Kontext, e: HhKonto): Dexie.Promise<string> {
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
    return this.db.HhKonto.put(e);
  }

  /**
   * Speichern eines Kontos.
   * @param e Betroffenes Konto.
   * @returns Eine Observable zur weiteren Verarbeitung.
   */
  public saveAccountOb(e: HhKonto): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveAccount(e)
        .then(a => s.next(HhBuchungActions.Empty()))
        .catch(ex => s.next(GlobalActions.SetError(ex)))
        .finally(() => s.complete());
    });
    return ob;
  }

  /**
   * Speichern eines Kontos.
   * @param e Betroffenes Konto.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  public saveAccount(e0: HhKonto): Dexie.Promise<HhKonto> {
    if (e0 == null) {
      return Dexie.Promise.resolve(null);
    }
    var e = Object.assign({}, e0); // Clone erzeugen
    let daten = this.getKontext();
    // Korrektur aus Import vom Server
    if (e.gueltigVon != null && typeof e.gueltigVon == 'string')
      e.gueltigVon = new Date(Date.parse(e.gueltigVon));
    if (e.gueltigBis != null && typeof e.gueltigBis == 'string')
      e.gueltigBis = new Date(Date.parse(e.gueltigBis));
    if (e.periodeVon != null && typeof e.periodeVon == 'string')
      e.periodeVon = Number((<string>e.periodeVon).replace(',', ''));
    if (e.periodeBis != null && typeof e.periodeBis == 'string')
      e.periodeBis = Number((<string>e.periodeBis).replace(',', ''));
    if (e.betrag != null && typeof e.betrag == 'string')
      e.betrag = Number((<string>e.betrag).replace(',', ''));
    if (e.ebetrag != null && typeof e.ebetrag == 'string')
      e.ebetrag = Number((<string>e.ebetrag).replace(',', ''));
    if (e.angelegtAm != null && typeof e.angelegtAm == 'string')
      e.angelegtAm = new Date(Date.parse(e.angelegtAm));
    if (e.geaendertAm != null && typeof e.geaendertAm == 'string')
      e.geaendertAm = new Date(Date.parse(e.geaendertAm));
    if (Global.nes(e.uid))
      e.uid = Global.getUID();
    e.name = Global.trim(e.name);
    if (Global.nes(e.name))
      return Dexie.Promise.reject('Bezeichnung fehlt');

    return this.getAccount(e.uid).then((alt: HhKonto) => {
      if (alt == null) {
        if (e.replid !== 'server')
          e.replid = Global.getUID();
        return this.iuHhKonto(daten, e).then(r => {
          return new Dexie.Promise<HhKonto>(resolve => resolve(e))
        });
      } else {
        let art = 0; // 0 überschreiben, (1 zusammenkopieren,) 2 lassen
        if (e.sortierung === alt.sortierung && e.art === alt.art && e.kz === alt.kz
          && e.name === alt.name && e.gueltigVon === alt.gueltigVon
          && e.gueltigBis === alt.gueltigBis && e.periodeVon === alt.periodeVon
          && e.periodeBis === alt.periodeBis && e.betrag === alt.betrag && e.ebetrag === alt.ebetrag) {
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
            alt.sortierung = e.sortierung;
            alt.art = e.art;
            alt.kz = e.kz;
            alt.gueltigVon = e.gueltigVon;
            alt.gueltigBis = e.gueltigBis;
            alt.periodeVon = e.periodeVon;
            alt.periodeBis = e.periodeBis;
            alt.betrag = e.betrag;
            alt.ebetrag = e.ebetrag;
          }
          //return Dexie.Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuHhKonto(daten, alt).then(r => {
            return new Dexie.Promise<HhKonto>(resolve => resolve(alt))
          });
        }
      }
      return alt;
    }); // .catch((ex) => console.log('speichereEintrag: ' + ex));
  }

  public postServerAccount(arr: HhKonto[]): void {
    let jarr = JSON.stringify({ 'HH_Konto': arr });
    this.postReadServer<HhKonto[]>('HH_Konto', jarr).subscribe(
      (a: HhKonto[]) => {
        a.forEach((e: HhKonto) => {
          this.store.dispatch(HhBuchungActions.SaveAccount({ account: e }));
          this.store.dispatch(HhBuchungActions.Load());
        });
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(GlobalActions.SetError(Global.handleError(err)));
      },
    );
  }
}
