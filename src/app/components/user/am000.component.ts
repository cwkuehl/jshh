import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { Login } from 'src/app/actions/global.actions';

@Component({
  selector: 'app-am000',
  template: `
<h3>Anmeldung</h3>

<form>
  <div class="form-row">
    <div class="form-group col-sm-6">
      <label class="control-label" for="user">Benutzer</label>
      <input type="text" class="form-control" name="user" [(ngModel)]="userId" placeholder="Angemeldeter Benutzer">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <button type="submit" class="btn btn-primary" (click)="login()">Anmelden</button>
    </div>
  </div>
</form>
  `,
  styles: [``]
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
