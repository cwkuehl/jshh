import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';

import { Parameter } from '../apis/parameter';
import { BaseService } from './base.service';
import { JshhDatabase } from '../components/database/database';

@Injectable({
  providedIn: 'root'
})
export class IdbService extends BaseService {

  constructor(private storage: StorageMap, db: JshhDatabase) {
    super(db);
    this.saveDb(new Blob());
    let user: Parameter = { schluessel: 'DB', wert: 'abc', angelegtAm: new Date(), angelegtVon: 'Hallo' };
    this.storage.set('user', user).subscribe(() => {});
    // this.storage.set('user', null).subscribe(() => {}); // delete
  }

  private saveDb(db: Blob) {
    this.storage.set('DB', db).subscribe({
      next: (user) => { console.log('Weiter: ' + user); },
      error: (error) => { console.log('Fehler: ' + error); },
    });
  }
}
