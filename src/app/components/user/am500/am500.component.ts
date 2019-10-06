import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { SaveReplGlobal } from 'src/app/actions/global.actions';

@Component({
  selector: 'app-am500',
  templateUrl: './am500.component.html',
  styleUrls: ['./am500.component.css']
})
export class Am500Component implements OnInit {
  replicationServer: string;

  constructor(private store: Store<AppState>) {
    store.select('replicationServer').subscribe(a => this.replicationServer = a);
  }

  ngOnInit() {
  }

  save() {
    this.store.dispatch(SaveReplGlobal(this.replicationServer));
  }
}
