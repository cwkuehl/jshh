import { Injectable } from '@angular/core';
//import idb from 'idb';
//import { openDB, deleteDB, wrap, unwrap } from 'idb';
//import { openDB } from 'idb/with-async-ittr.js';
import { StorageMap } from '@ngx-pwa/local-storage';

import { Observable, Subject } from 'rxjs';
import { Parameter } from '../apis/parameter';
import { BaseService } from './base.service';


@Injectable({
  providedIn: 'root'
})
export class IdbService extends BaseService {

  //private _dataChange: Subject<Parameter> = new Subject<Parameter>();
  //private _dbPromise;

  constructor(private storage: StorageMap) {
    super();
    //this.createDB();
    //this.connectToIDB();
    let user: Parameter = { schluessel: 'DB', wert: 'abc', angelegtAm: new Date(2019, 9, 7), angelegtVon: 'Hallo' };
    this.storage.set('user', user).subscribe(() => {});
    // this.storage.set('user', null).subscribe(() => {}); // delete
   }

   async createDB() {
    // const db = await openDB('jshh-database', 1, {
    //   upgrade(db) {
    //     console.log('making a new object store');
    //     db.createObjectStore('parameter', { keyPath: 'schluessel', autoIncrement: false });
    //   }
    // });
    //await db.put('parameter', { schluessel: 'DB', wert: "abc" }, 1);
    //await db.put('parameter', { schluessel: 27 }, 2);
  }

  connectToIDB() {
    // this._dbPromise = idb.open('jshh-database', 1, UpgradeDB => {
    //   if (!UpgradeDB.objectStoreNames.contains('Items')) {
    //     UpgradeDB.createObjectStore('Items', {keyPath: 'id', autoIncrement: true});
    //   }
    //   if (!UpgradeDB.objectStoreNames.contains('Sync-Items')) {
    //     UpgradeDB.createObjectStore('Sync-Items', {keyPath: 'id', autoIncrement: true});
    //   }
    // });
  }

  // addItems(target: string, value: Parameter) {
  //   this._dbPromise.then((db: any) => {
  //     const tx = db.transaction(target, 'readwrite');
  //     tx.objectStore(target).put({
  //     schluessel: value.schluessel,
  //     wert: value.wert,
  //     angelegtAm: value.angelegtAm,
  //     angelegtVon: value.angelegtVon,
  //     geaendertAm: value.geaendertAm,
  //     geaendertVon: value.geaendertVon
  //   });
  //   this.getAllData('Items').then((items: Parameter) => {
  //     this._dataChange.next(items);
  //   });
  //     return tx.complete;
  //   });
  // }

  // deleteItems(target: string, value: Parameter) {
  //   this._dbPromise.then((db: any) => {
  //     const tx = db.transaction(target, 'readwrite');
  //     const store = tx.objectStore(target);
  //     store.delete(value);
  //     this.getAllData(target).then((items: Parameter) => {
  //       this._dataChange.next(items);
  //     });
  //   return tx.complete;
  //   });
  // }

  // getAllData(target: string) {
  //   return this._dbPromise.then((db: any) => {
  //     const tx = db.transaction(target, 'readonly');
  //     const store = tx.objectStore(target);
  //     return store.getAll();
  //   });
  // }

  // dataChanged(): Observable<Parameter> {
  //     return this._dataChange;
  //   }
}
