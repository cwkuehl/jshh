import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { asyncScheduler } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import * as FzNotizActions from '../../actions/fznotiz.actions';
import * as GlobalActions from '../../actions/global.actions';
import { FzNotiz } from '../../apis';
import { AppState } from '../../app.state';
import { PrivateService } from '../../services';

@Component({
  selector: 'app-fz700',
  template: `
  <h3>Notizen</h3>

  <div class="row">
    <div class="form-group col">
      <button type="button" class="btn btn-primary ml-1" (click)="replicate()" title="Notizen-Ablgeich mit Server"><img src="assets/icons/ic_cached_white_24dp.png"/></button>
      <button type="button" class="btn btn-primary ml-1" (click)="delete()" title="Notizen löschen"><img src="assets/icons/ic_delete_white_24dp.png"/></button>
    </div>
  </div>

  <div class="row card mt-1" *ngIf="memos.length > 0">

    <table class="table table-contensed" >
      <thead>
      <tr>
        <th>Nr.</th>
        <th>Thema</th>
        <th>Geändert am</th>
        <th>Geändert von</th>
        <th>Angelegt am</th>
        <th>Angelegt von</th>
      </tr>
      </thead>
      <tr *ngFor="let item of memos"> <!-- [class.active]="item === selectedFlight"> -->
        <td><a [routerLink]="['/memo', item.uid]">{{item.uid}}</a></td>
        <td>{{item.thema}}</td>
        <td>{{item.geaendertAm | date:'yyyy-MM-ddTHH:mm:ss'}}</td>
        <td>{{item.geaendertVon}}</td>
        <td>{{item.angelegtAm | date:'yyyy-MM-ddTHH:mm:ss'}}</td>
        <td>{{item.angelegtVon}}</td>
      </tr>
    </table>
  </div>
  `,
  styles: [``]
})
export class Fz700Component implements OnInit {

  memos: FzNotiz[] = [];
  //memos: Observable<FzNotiz[]>;

  constructor(private store: Store<AppState>, private actions$: Actions, private privateservice: PrivateService) {
    //this.memos = store.select('memos');
    //this.privateservice.loadMemos();
    this.actions$.pipe(
      ofType(FzNotizActions.Load),
      throttleTime(100, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(() => this.reload());
    this.reload();
  }

  ngOnInit() {
    //this.store.dispatch(FzNotizActions.LoadFzNotiz());
  }

  public reload() {
    this.privateservice.getMemoList(null).then(l => { if (l != null) this.memos = l; });
  }

  public delete() {
    if (!confirm('Sollen wirklich alle Notizen gelöscht werden?'))
      return;
    this.store.dispatch(GlobalActions.SetError(null));
    this.privateservice.deleteAllMemosOb().subscribe(() => this.reload());
  }

  public replicate() {
    this.store.dispatch(GlobalActions.SetError(null));
    this.privateservice.getMemoList('server')
      .then(l => this.privateservice.postServer(l || []))
      .catch(e => this.store.dispatch(GlobalActions.SetError(e)));
  }
}
