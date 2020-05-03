import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SaveOptions } from '../../actions/global.actions';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-am500',
  template: `
<h4>Einstellungen</h4>

<form>
  <div class="form-row">
    <div class="form-group col-sm-6">
      <label class="control-label" for="url">Replikation-URL</label>
      <input type="text" class="form-control" name="url" [(ngModel)]="server" placeholder="URL für Replikationsserver">
    </div>
  </div>
  <div class="form-row">
      <div class="form-group col-sm-6">
      <label class="control-label" for="days">Anzahl Tage</label>&nbsp;
      <input type="text" class="form-control" name="days" [(ngModel)]="days" title="Anzahl Tage">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <button type="submit" class="btn btn-primary ml-1" (click)="save()"><img src="assets/icons/ic_save_white_24dp.png"/></button>
      <a class="btn btn-primary ml-1" title="Schließen ohne Speichern." [routerLink]="'/'"><img src="assets/icons/ic_cancel_white_24dp.png"/></a>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Am500Component implements OnInit {
  server: string;
  days: string;

  constructor(private store: Store<AppState>) {
    store.select('options').subscribe(a => {
      this.server = a.replicationServer;
      this.days = a.replicationDays;
    });
  }

  ngOnInit() {
  }

  save() {
    this.store.dispatch(SaveOptions({ options: { replicationServer: this.server, replicationDays: this.days } }));
  }
}
