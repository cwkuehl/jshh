import { Component, OnInit } from '@angular/core';
import { FzNotiz } from '../../../apis';
import { Observable } from 'rxjs';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { PrivateService } from '../../../services';
import * as FzNotizActions from '../../../actions/fznotiz.actions'
import * as GlobalActions from '../../../actions/global.actions'
import { HttpErrorResponse } from '@angular/common/http';
import { Global } from '../../../services/global';

@Component({
  selector: 'app-fz700',
  templateUrl: './fz700.component.html',
  styleUrls: ['./fz700.component.css']
})
export class Fz700Component implements OnInit {

  //memos: Observable<FzNotiz[]>;

  constructor(private store: Store<AppState>, private actions$: Actions, private privateservice: PrivateService) {
    //this.memos = store.select('memos');
    this.privateservice.loadMemos();
  }

  ngOnInit() {
    //this.store.dispatch(FzNotizActions.LoadFzNotiz());
  }

  get memos(): FzNotiz[] {
    return this.privateservice.memos;
  }

  public delete() {
    this.store.dispatch(GlobalActions.SetErrorGlobal(null));
    this.privateservice.deleteAllMemosOb().subscribe(() => Global.machNichts());
  }

  public replicate() {
    this.store.dispatch(GlobalActions.SetErrorGlobal(null));
    //this.privateservice.getMemoList('server').then(a => this.postReadServer(a))
    //.catch(a => this.store.dispatch(GlobalActions.SetErrorGlobal(a)));
    this.postReadServer(this.memos);
  }

  postReadServer(arr: FzNotiz[]) {
    let jarr = JSON.stringify({'FZ_Notiz': arr});
    this.privateservice.postServer<FzNotiz[]>('FZ_Notiz', 'read', jarr).subscribe(
      (a: FzNotiz[]) => {
        a.reverse().forEach((e: FzNotiz) => {
          this.store.dispatch(FzNotizActions.SaveFzNotiz(e));
          //this.store.dispatch(TbEintragActions.LoadTbEintrag());
        });
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(GlobalActions.SetErrorGlobal(Global.handleError(err)));
      },
    );
  }
}
