import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { JshhDatabase } from '../components/database/database';
import { BaseService } from './base.service';
import { FzNotiz } from '../apis';
import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class PrivateService extends BaseService {

  constructor(db: JshhDatabase) {
    super(db);
  }

  getNotizListe(replidne: string): Dexie.Promise<FzNotiz[]> {

    if (Global.nes(replidne))
      return this.db.FzNotiz.toArray();
    else
      return this.db.FzNotiz.where('replid').notEqual(replidne).toArray();
  }

}
