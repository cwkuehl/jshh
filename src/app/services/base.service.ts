import { JshhDatabase } from '../components/database/database';
import { Kontext } from '../apis';
import { Global } from '.';

export class BaseService {

  constructor(protected db: JshhDatabase) { }

  // Globale Konstanten
  protected SU_MAXX: number = 9; // 6
  protected SU_MAXXW: number = 3; // 3
  protected SU_MAXYW: number = 3; // 2

  public getKontext(): Kontext {

    // console.log('getKontext: ' + this.benutzerId);
    return { benutzerId: this.db.userId, jetzt: Global.now(), heute: Global.today() };
  }

}
