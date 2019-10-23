import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { Login } from 'src/app/actions/global.actions';

@Component({
  selector: 'app-am000',
  templateUrl: './am000.component.html',
  styleUrls: ['./am000.component.css']
})
export class Am000Component implements OnInit {
  userId: string;

  constructor(private store: Store<AppState>) {
    store.select('userId').subscribe(a => this.userId = a);
  }

  ngOnInit() {
  }

  login() {
    this.store.dispatch(Login(this.userId));
  }
}
