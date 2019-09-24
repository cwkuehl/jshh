import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { JshhDatabase } from '../components/database/database';
import { Observable, from, of, range } from 'rxjs';
import { TbEintrag } from '../apis';
import { Global } from '.';

@Injectable({
  providedIn: 'root'
})
export class DiaryService extends BaseService {

  constructor(private db: JshhDatabase) {
    super();
  }

  load(): Observable<TbEintrag> {
    return of({datum: Global.today(), eintrag: 'Hallo', angelegtAm: Global.now(), angelegtVon: 'abc'});
  }
}
