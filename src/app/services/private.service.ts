import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { JshhDatabase } from '../components/database/database';

@Injectable({
  providedIn: 'root'
})
export class PrivateService extends BaseService {

  constructor(db: JshhDatabase) {
    super(db);
    var x = 5;
  }
}
