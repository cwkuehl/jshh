import { Component, OnInit } from '@angular/core';
import { FzNotiz } from '../../../apis';
import { Observable } from 'rxjs';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { PrivateService } from '../../../services';
import * as FzNotizActions from '../../../actions/fznotiz.actions'

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
}
