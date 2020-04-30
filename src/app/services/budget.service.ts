import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import Dexie from 'dexie';
import { Kontext, HhBuchung, HhKonto, HhEreignis } from '../apis';
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
  getBooking(uid: string): Promise<HhBuchung> {
    let l = this.db.HhBuchung.get(uid);
    return l;
  }

  /**
   * Schreiben einer Buchung mit Anpassung der Revisionsdaten.
   * @param daten Betroffener Kontext.
   * @param e Betroffene Entity.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  private iuHhBuchung(daten: Kontext, e: HhBuchung): Promise<string> {
    if (daten == null || e == null) {
      return Promise.reject('Parameter fehlt');
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
      //.finally(() => s.complete());
    });
    return ob;
  }

  /**
   * Speichern einer Buchung.
   * @param e Betroffene Buchung.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  public async saveBooking(e0: HhBuchung): Promise<HhBuchung> {
    if (e0 == null) {
      return Promise.resolve(null);
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
    e.habenValuta = e.sollValuta;
    e.betrag = Global.round(e.ebetrag * 1.95583)
    e.btext = Global.trim(e.btext);
    e.belegNr = Global.trimNull(e.belegNr);
    if (e.replid != 'server') {
      if (e.sollValuta == null)
        return Promise.reject('Valuta fehlt');
      if (e.betrag <= 0 || e.ebetrag <= 0)
        return Promise.reject('Betrag fehlt');
      if (Global.nes(e.btext))
        return Promise.reject('Buchungstext fehlt');
      if (e.belegDatum == null)
        return Promise.reject('Belegdatum fehlt');
      if (Global.nes(e.sollKontoUid))
        return Promise.reject('Sollkonto fehlt');
      if (Global.nes(e.habenKontoUid))
        return Promise.reject('Habenkonto fehlt');
      if (e.sollKontoUid === e.habenKontoUid)
        return Promise.reject('Soll- und Habenkonto müssen sich unterscheiden');
      const sk = await this.getAccount(e.sollKontoUid);
      const hk = await this.getAccount(e.habenKontoUid);
      if (sk == null)
        return Promise.reject('Sollkonto fehlt');
      if (hk == null)
        return Promise.reject('Habenkonto fehlt');
      if (sk.kz === 'E' || sk.kz === 'G' || hk.kz === 'E' || hk.kz === 'G')
        return Promise.reject('Das Eigenkapital- und Gewinn+Verlust-Konto sind nicht bebuchbar.');
      if (sk.gueltigVon != null && e.sollValuta.getTime() < sk.gueltigVon.getTime())
        return Promise.reject('Das Sollkonto ist erst ab ' + sk.gueltigVon + ' gültig.');
      if (sk.gueltigBis != null && e.sollValuta.getTime() > sk.gueltigBis.getTime())
        return Promise.reject('Das Sollkonto ist nur bis ' + sk.gueltigBis + ' gültig.');
      if (hk.gueltigVon != null && e.sollValuta.getTime() < hk.gueltigVon.getTime())
        return Promise.reject('Das Habenkonto ist erst ab ' + hk.gueltigVon + ' gültig.');
      if (hk.gueltigBis != null && e.sollValuta.getTime() > hk.gueltigBis.getTime())
        return Promise.reject('Das Habenkonto ist nur bis ' + hk.gueltigBis + ' gültig.');
    }
    return this.getBooking(e.uid).then((alt: HhBuchung) => {
      if (alt == null) {
        if (e.replid !== 'server')
          e.replid = Global.getUID();
        return this.iuHhBuchung(daten, e).then(r => {
          return new Promise<HhBuchung>(resolve => resolve(e))
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
          //return Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuHhBuchung(daten, alt).then(r => {
            return new Promise<HhBuchung>(resolve => resolve(alt))
          });
        }
      }
      return alt;
    }); // .catch((ex) => console.log('speichereEintrag: ' + ex));
  }

  /**
   * Stornieren einer Buchung.
   * @param e Betroffene Uid.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  public async reverseBooking(uid: string): Promise<HhBuchung> {
    if (Global.nes(uid)) {
      return Promise.reject('Die UID fehlt.');
    }
    let daten = this.getKontext();
    return this.getBooking(uid).then((alt: HhBuchung) => {
      if (alt == null)
        return Promise.reject('Die Buchung fehlt.');
      alt.kz = alt.kz == 'A' ? 'S' : 'A';
      if (alt.replid === 'server')
        alt.replid = Global.getUID();
      return this.iuHhBuchung(daten, alt).then(r => {
        return new Promise<HhBuchung>(resolve => resolve(alt))
      });
    });
  }

  /**
   * Löschen aller Buchungen, Ereignisse und Konten.
   */
  public deleteAllBookingsOb(): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.db.transaction('rw', this.db.HhBuchung, this.db.HhEreignis, this.db.HhKonto, async () => {
        var c = await this.db.HhBuchung.count();
        await this.db.HhBuchung.toCollection().delete();
        if (c <= 0) {
          await this.db.HhEreignis.toCollection().delete();
          await this.db.HhKonto.toCollection().delete();
        }
      })
        .then(a => s.next(HhBuchungActions.Empty()))
        .catch(ex => s.next(GlobalActions.SetError(ex)))
        .finally(() => s.complete());
    });
    return ob;
  }

  /**
   * Senden und Empfangen von Buchung-Listen zur Replikation.
   * @param arr Liste von geänderten Entities.
   */
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

  /**
   * Lesen einer Liste von Konten.
   * @param uid Betroffene ID.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
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
  getAccount(uid: string): Promise<HhKonto> {
    let l = this.db.HhKonto.get(uid);
    return l;
  }

  /**
   * Schreiben eines Kontos mit Anpassung der Revisionsdaten.
   * @param daten Betroffener Kontext.
   * @param e Betroffene Entity.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  private iuHhKonto(daten: Kontext, e: HhKonto): Promise<string> {
    if (daten == null || e == null) {
      return Promise.reject('Parameter fehlt');
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
      //.finally(() => s.complete());
    });
    return ob;
  }

  /**
   * Speichern eines Kontos.
   * @param e Betroffenes Konto.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  public saveAccount(e0: HhKonto): Promise<HhKonto> {
    if (e0 == null) {
      return Promise.resolve(null);
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
      return Promise.reject('Bezeichnung fehlt');

    return this.getAccount(e.uid).then((alt: HhKonto) => {
      if (alt == null) {
        if (e.replid !== 'server')
          e.replid = Global.getUID();
        return this.iuHhKonto(daten, e).then(r => {
          return new Promise<HhKonto>(resolve => resolve(e))
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
          //return Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuHhKonto(daten, alt).then(r => {
            return new Promise<HhKonto>(resolve => resolve(alt))
          });
        }
      }
      return alt;
    }); // .catch((ex) => console.log('speichereEintrag: ' + ex));
  }

  /**
   * Senden und Empfangen von Konto-Listen zur Replikation.
   * @param arr Liste von geänderten Entities.
   */
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

  /**
   * Lesen einer Liste von Ereignissen.
   * @param uid Betroffene ID.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  getEventList(replidne: string): Promise<HhEreignis[]> {
    if (Global.nes(replidne)) {
      return this.db.HhEreignis.orderBy('bezeichnung').toArray();
    } else
      return this.db.HhEreignis.where('replid').notEqual(replidne).sortBy('bezeichnung');
  }

  /**
   * Lesen eines Ereignisses.
   * @param uid Betroffene ID.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  getEvent(uid: string): Promise<HhEreignis> {
    let l = this.db.HhEreignis.get(uid);
    return l;
  }

  /**
   * Schreiben eines Kontos mit Anpassung der Revisionsdaten.
   * @param daten Betroffener Kontext.
   * @param e Betroffene Entity.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  private iuHhEreignis(daten: Kontext, e: HhEreignis): Promise<string> {
    if (daten == null || e == null) {
      return Promise.reject('Parameter fehlt');
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
    return this.db.HhEreignis.put(e);
  }

  /**
   * Speichern eines Ereignisses.
   * @param e Betroffenes Ereignis.
   * @returns Eine Observable zur weiteren Verarbeitung.
   */
  public saveEventOb(e: HhEreignis): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveEvent(e)
        .then(a => s.next(HhBuchungActions.Empty()))
        .catch(ex => s.next(GlobalActions.SetError(ex)))
      //.finally(() => s.complete());
    });
    return ob;
  }

  /**
   * Speichern eines Ereignisses.
   * @param e Betroffenes Ereignis.
   * @returns Ein Promise zur weiteren Verarbeitung.
   */
  public saveEvent(e0: HhEreignis): Promise<HhEreignis> {
    if (e0 == null) {
      return Promise.resolve(null);
    }
    var e = Object.assign({}, e0); // Clone erzeugen
    let daten = this.getKontext();
    // Korrektur aus Import vom Server
    if (e.angelegtAm != null && typeof e.angelegtAm == 'string')
      e.angelegtAm = new Date(Date.parse(e.angelegtAm));
    if (e.geaendertAm != null && typeof e.geaendertAm == 'string')
      e.geaendertAm = new Date(Date.parse(e.geaendertAm));
    if (Global.nes(e.uid))
      e.uid = Global.getUID();
    e.kz = Global.trimNull(e.kz);
    e.bezeichnung = Global.trim(e.bezeichnung);
    e.etext = Global.trim(e.etext);
    if (Global.nes(e.bezeichnung))
      return Promise.reject('Bezeichnung fehlt');
    if (Global.nes(e.etext))
      return Promise.reject('Buchungstext fehlt');

    return this.getEvent(e.uid).then((alt: HhEreignis) => {
      if (alt == null) {
        if (e.replid !== 'server')
          e.replid = Global.getUID();
        return this.iuHhEreignis(daten, e).then(r => {
          return new Promise<HhEreignis>(resolve => resolve(e))
        });
      } else {
        let art = 0; // 0 überschreiben, (1 zusammenkopieren,) 2 lassen
        if (e.kz === alt.kz && e.sollKontoUid === alt.sollKontoUid && e.habenKontoUid === alt.habenKontoUid
          && e.bezeichnung === alt.bezeichnung && e.etext === alt.etext) {
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
            alt.kz = e.kz;
            alt.sollKontoUid = e.sollKontoUid;
            alt.habenKontoUid = e.habenKontoUid;
            alt.bezeichnung = e.bezeichnung;
            alt.etext = e.etext;
          }
          //return Promise.reject('Fehler beim Ändern.');
        }
        if (art != 2) {
          return this.iuHhEreignis(daten, alt).then(r => {
            return new Promise<HhEreignis>(resolve => resolve(alt))
          });
        }
      }
      return alt;
    }); // .catch((ex) => console.log('speichereEintrag: ' + ex));
  }

  /**
   * Senden und Empfangen von Ereignis-Listen zur Replikation.
   * @param arr Liste von geänderten Entities.
   */
  public postServerEvent(arr: HhEreignis[]): void {
    let jarr = JSON.stringify({ 'HH_Ereignis': arr });
    this.postReadServer<HhEreignis[]>('HH_Ereignis', jarr).subscribe(
      (a: HhEreignis[]) => {
        a.forEach((e: HhEreignis) => {
          this.store.dispatch(HhBuchungActions.SaveEvent({ event: e }));
          this.store.dispatch(HhBuchungActions.Load());
        });
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(GlobalActions.SetError(Global.handleError(err)));
      },
    );
  }
}
