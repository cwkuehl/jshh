import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { JshhDatabase } from '../components/database/database';
import { Observable, from, of, range } from 'rxjs';
import { TbEintrag } from '../apis';
import { Global } from '.';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DiaryService extends BaseService {

  constructor(private db: JshhDatabase) {
    super();
  }

  getEintrag(datum: Date): Dexie.Promise<TbEintrag> {

    if (datum == null) {
      return Dexie.Promise.resolve(null);
    }
    return Dexie.Promise.resolve(this.getTbEintrag(datum));
  }

  getTbEintrag(datum: Date): Dexie.Promise<TbEintrag> {

    // console.log('getEintrag: ' + datum);
    // let l = this.db.TbEintrag.where('datum').equals(datum).first().finally(
    //  () => console.log('getEintrag finally'));
    let l = this.db.TbEintrag.get(datum); // .catch(e => console.log('Fehler: ' + e));
    return l;
  }

  load(): Observable<TbEintrag> {
    return of({datum: Global.today(), eintrag: 'Hallo', angelegtAm: Global.now(), angelegtVon: 'abc'});
  }
}
