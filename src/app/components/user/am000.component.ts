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
  <div class="row">
    <div class="col-sm-6">
      <label class="control-label" for="user">Benutzer</label>
      <input type="text" class="form-control" name="user" [(ngModel)]="userId" placeholder="Angemeldeter Benutzer">
    </div>
  </div>
  <div class="row">
    <div class="col">
      <button type="submit" class="btn btn-primary" title="Anmelden" (click)="login()"><img src="assets/icons/ic_save_white_24dp.png"/></button>&nbsp;
      <a class="btn btn-primary" title="Schließen ohne Speichern." [routerLink]="'/'"><img src="assets/icons/ic_cancel_white_24dp.png"/></a>&nbsp;
    </div>
  </div>
  <div class="row mt-1">
    <div class="col">
      <button class="btn btn-primary" title="Prüfen auf neue Programm-Version" (click)="checkForUpdate()">Neue Version prüfen?</button>&nbsp;
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
