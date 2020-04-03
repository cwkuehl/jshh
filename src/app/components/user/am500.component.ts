import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SaveOptions } from '../../actions/global.actions';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-am500',
  template: `
<h3>Einstellungen</h3>

<form>
  <div class="form-row">
    <div class="form-group col-sm-6">
      <label class="control-label" for="url">Replikation-URL</label>
      <input type="text" class="form-control" name="url" [(ngModel)]="server" placeholder="URL für Replikationsserver">
    </div>
  </div>
  <div class="form-row">
      <div class="form-group col-sm-6">
      <label class="control-label" for="months">Anzahl Monate</label>&nbsp;
      <input type="text" class="form-control" name="months" [(ngModel)]="months" title="Anzahl Monate">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <button type="submit" class="btn btn-primary" (click)="save()">Speichern</button>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Am500Component implements OnInit {
  server: string;
  months: string;

  constructor(private store: Store<AppState>) {
    store.select('options').subscribe(a => {
      this.server = a.replicationServer;
      this.months = a.replicationMonths;
    });
  }

  ngOnInit() {
  }

  save() {
    this.store.dispatch(SaveOptions({ options: { replicationServer: this.server, replicationMonths: this.months } }));
  }
}
