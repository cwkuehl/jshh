import { JshhDatabase } from './database';
import { Kontext, Options } from '../apis';
import { Global } from './global';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';

export class BaseService {

  protected options: Options;

  constructor(protected store: Store<AppState>, protected db: JshhDatabase, protected http: HttpClient) {
    store.select('options').subscribe(a => this.options = a);
  }

  // Globale Konstanten
  protected SU_MAXX: number = 9; // 6
  protected SU_MAXXW: number = 3; // 3
  protected SU_MAXYW: number = 3; // 2

  public getKontext(): Kontext {
    // console.log('getKontext: ' + this.benutzerId);
    return { benutzerId: this.db.userId, jetzt: Global.now(), heute: Global.today() };
  }

  protected postReadServer<T>(table: string, data: string): Observable<T> {

    let url = this.options.replicationServer;
    let days = Math.max(1, Global.toInt(this.options.replicationDays));
    let mode = `read_${days}d`;
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      //'Authorization': 'my-auth-token'
    });
    // let params = {
    //   'table': table,
    //   'mode': mode,
    // };
    let daten = this.getKontext();
    let body = JSON.stringify({
      'token': daten.benutzerId,
      'table': table,
      'mode': mode,
      'data': data,
    });
    return this.http.post<T>(url, body, { reportProgress: false, /* params, */headers });
  }
}
