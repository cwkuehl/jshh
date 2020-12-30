import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { Login } from 'src/app/actions/global.actions';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-am000',
  template: `
<h4>Anmeldung</h4>

<form>
  <div class="form-row">
    <div class="form-group col-sm-6">
      <label class="control-label" for="user">Benutzer</label>
      <input type="text" class="form-control" name="user" [(ngModel)]="userId" placeholder="Angemeldeter Benutzer">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <button type="submit" class="btn btn-primary ml-1" title="Anmelden" (click)="login()"><img src="assets/icons/ic_save_white_24dp.png"/></button>
      <a class="btn btn-primary ml-1" title="Schließen ohne Speichern." [routerLink]="'/'"><img src="assets/icons/ic_cancel_white_24dp.png"/></a>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <button class="btn btn-primary ml-1" title="Prüfen auf neue Programm-Version" (click)="checkForUpdate()">Neue Version prüfen?</button>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Am000Component implements OnInit {
  userId: string;

  constructor(private store: Store<AppState>, private swUpdate: SwUpdate) {
    store.select('userId').subscribe(a => this.userId = a);
    this.swUpdate.available.subscribe(event => {
      console.log('New update available');
      this.updateToLatest();
    });
  }

  ngOnInit() {
  }

  login() {
    this.store.dispatch(Login(this.userId));
  }

  checkForUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then(() => {
        console.log('Checking for updates...');
      }).catch((err) => {
        console.error('Error when checking for update', err);
      });
    }
  }

  updateToLatest(): void {
    console.log('Updating to latest version.');
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
