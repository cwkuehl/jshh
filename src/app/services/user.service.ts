import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import Dexie from 'dexie';
import { Observable, of } from 'rxjs';
import { Global } from './global';
import * as GlobalActions from '../actions/global.actions';
import { Kontext, TbEintrag, Parameter } from '../apis';
import { JshhDatabase } from '../components/database/database';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  constructor(db: JshhDatabase) {
    super(db);
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
        .then(a => s.next(GlobalActions.LoginOkGlobal(a.wert)))
        .catch(e => s.next(GlobalActions.SetErrorGlobal(e)))
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
        return new Dexie.Promise<Parameter>((resolve) => { resolve(parameter); })
      });
    });
  }

  public saveParamOb(key: string, value: string): Observable<Action> {
    var ob = new Observable<Action>(s => {
      this.saveParam(key, value)
        .then(a => s.next(GlobalActions.SaveReplOkGlobal(a.wert)))
        .catch(e => s.next(GlobalActions.SetErrorGlobal(e)))
        .finally(() => s.complete());
    });
    return ob;
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
      return this.iuParameter(daten, parameter).then(r => {
        return new Dexie.Promise<Parameter>((resolve) => { resolve(parameter); })
      });
    });
  }
}
