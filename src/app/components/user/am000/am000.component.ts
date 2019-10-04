import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { LoginGlobal, SaveReplGlobal } from 'src/app/actions/global.actions';

@Component({
  selector: 'app-am000',
  templateUrl: './am000.component.html',
  styleUrls: ['./am000.component.css']
})
export class Am000Component implements OnInit {
  userId: string;
  replicationServer: string;

  constructor(private store: Store<AppState>) {
    store.select('userId').subscribe(a => this.userId = a);
    store.select('replicationServer').subscribe(a => this.replicationServer = a);
  }

  ngOnInit() {
  }

  login() {
    this.store.dispatch(LoginGlobal(this.userId));
    this.store.dispatch(SaveReplGlobal(this.replicationServer));
  }
}
