import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PrivateService extends BaseService {

  constructor() {
    super();
    var x = 5;
  }
}
