import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as GlobalActions from '../../actions/global.actions';
import { FzNotiz } from '../../apis';
import { AppState } from '../../app.state';
import { PrivateService } from '../../services';
import { Global } from '../../services/global';

@Component({
  selector: 'app-fz710',
  template: `
<h3>Notiz</h3>

<form>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="theme">Thema</label>
      <input type="text" class="form-control" name="theme" [(ngModel)]="item.thema" title="Thema" placeholder="Thema">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="memo">Notiz</label>
      <textarea class="form-control" name="memo" [(ngModel)]="item.notiz" rows="5" cols="20" title="Notiz" placeholder="Notiz"></textarea>
    </div>
  </div>
  <div class="form-row">
    <button type="submit" class="btn btn-primary col-sm-2" (click)="save()">Speichern</button>
    <a class="btn btn-primary col-sm-2 ml-1" [routerLink]="'/memos'">Abbrechen</a>
  </div>
</form>
  `,
  styles: [``]
})
export class Fz710Component implements OnInit {

  item: FzNotiz = { uid: '', thema: '', notiz: '' };

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private actions$: Actions, private privateservice: PrivateService) {
    this.route.params.subscribe(
      params => this.privateservice.getMemo(params['id'])
        .then(a => { if (a != null) this.item = a; })
        .finally(() => { if (Global.nes(this.item.uid)) this.store.dispatch(GlobalActions.SetError('Notiz nicht gefunden.')); })
    );
  }

  ngOnInit() {
    //this.store.dispatch(FzNotizActions.LoadFzNotiz());
  }

  public delete() {
    this.store.dispatch(GlobalActions.SetError(null));
    //this.privateservice.deleteAllMemosOb().subscribe(() => this.reload());
  }

  public save() {
    // nix
  }
}
