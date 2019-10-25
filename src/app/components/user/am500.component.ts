import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SaveRepl } from '../../actions/global.actions';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-am500',
  template: `
<h3>Einstellungen</h3>

<form>
  <div class="form-row">
    <div class="form-group col-sm-6">
      <label class="control-label" for="url">Replikation-URL</label>
      <input type="text" class="form-control" name="url" [(ngModel)]="replicationServer" placeholder="URL für Replikationsserver">
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
  replicationServer: string;

  constructor(private store: Store<AppState>) {
    store.select('replicationServer').subscribe(a => this.replicationServer = a);
  }

  ngOnInit() {
  }

  save() {
    this.store.dispatch(SaveRepl(this.replicationServer));
  }
}
