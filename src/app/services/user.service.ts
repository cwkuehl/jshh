import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import Dexie from 'dexie';
import { Observable, of } from 'rxjs';
import { Global } from './global';
import * as GlobalActions from '../actions/global.actions';
import { Kontext, TbEintrag, Parameter, Options } from '../apis';
import { JshhDatabase } from './database';
import { BaseService } from './base.service';
import { AppState } from '../app.state';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  constructor(store: Store<AppState>, db: JshhDatabase, http: HttpClient) {
    super(store, db, http);
  }

  getParameter(key: string): Dexie.Promise<Parameter> {

    let l = this.db.Parameter.get(key); // .catch(e => console.log('Fehler: ' + e));
    return l;
  }

  iuParameter(daten: Kontext, e: Parameter): Dexie.Promise<string> {

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
    return this.db.Parameter.put(e);
  }

  public loginOb(userId: string): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.login(userId)
        .then(a => s.next(GlobalActions.LoginOk(a.wert)))
        .catch(e => s.next(GlobalActions.SetError(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public login(userId: string): Dexie.Promise<Parameter> {

    if (Global.nes(userId)) {
      return Dexie.Promise.reject('Die Benutzer-ID darf nicht leer sein.');
    }
    let daten = this.getKontext();
    return this.getParameter('UserId').then((parameter: Parameter) => {
      if (parameter == null)
        parameter = { schluessel: 'UserId', wert: userId };
      else
        parameter.wert = userId;
      return this.iuParameter(daten, parameter).then(r => {
        return new Dexie.Promise<Parameter>(resolve => resolve(parameter))
      });
    });
  }

  public getOptions(): Dexie.Promise<Options> {
    let options: Options = { replicationServer: null, replicationDays: null };
    return this.db.Parameter.get('ReplicationServer')
      .then(a => { if (a != null) options.replicationServer = a.wert; })
      .then(() => this.db.Parameter.get('ReplicationDays'))
      .then(a => { if (a != null) options.replicationDays = a.wert; })
      .then(() => new Dexie.Promise<Options>(resolve => resolve(options)));
  }

  public saveOptionsOb(options: Options): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveOptions(options)
        .then(a => s.next(GlobalActions.SaveOptionsOk({ options: a })))
        .catch(e => s.next(GlobalActions.SetError(e)))
        .finally(() => s.complete());
    });
    return ob;
  }

  public saveOptions(options: Options): Dexie.Promise<Options> {
    if (options == null) {
      return Dexie.Promise.reject('Die Optionen dürfen nicht leer sein.');
    }
    if (Global.nes(options.replicationServer)) {
      return Dexie.Promise.reject('Die URL für den Replikationsserver muss angegeben werden.');
    }
    if (Global.toInt(options.replicationDays) <= 0) {
      return Dexie.Promise.reject('Die Tage müssen größer 0 sein.');
    }
    return this.saveParam('ReplicationServer', options.replicationServer)
      .then(() => this.saveParam('ReplicationDays', options.replicationDays))
      .then(() => new Dexie.Promise<Options>(resolve => resolve(options)));
  }

  public saveParam(key: string, value: string): Dexie.Promise<Parameter> {
    if (Global.nes(key)) {
      return Dexie.Promise.reject('Der Schlüssel darf nicht leer sein.');
    }
    let daten = this.getKontext();
    return this.getParameter(key).then((parameter: Parameter) => {
      if (parameter == null)
        parameter = { schluessel: key, wert: value };
      else
        parameter.wert = value;
      return this.iuParameter(daten, parameter)
        .then(r => new Dexie.Promise<Parameter>(resolve => resolve(parameter)));
    });
  }
}
