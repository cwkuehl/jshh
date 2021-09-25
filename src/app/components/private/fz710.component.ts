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
<h4>Notiz</h4>

<form>
  <div class="row">
    <div class="col">
      <label class="control-label d-none d-md-block" for="theme">Thema</label>
      <input type="text" class="form-control" name="theme" [(ngModel)]="item.thema" title="Thema" placeholder="Thema">
    </div>
  </div>
  <div class="row">
    <div class="col">
      <label class="control-label d-none d-md-block" for="memo">Notiz</label>
      <textarea class="form-control" name="memo" [(ngModel)]="item.notiz" rows="8" cols="20" title="Notiz" placeholder="Notiz"></textarea>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <!--button type="submit" class="btn btn-primary" title="Schließen mit Speichern." (click)="save()"><img src="assets/icons/ic_save_white_24dp.png"/></button>&nbsp;-->
      <a class="btn btn-primary" title="Schließen ohne Speichern." [routerLink]="'/memos'"><img src="assets/icons/ic_cancel_white_24dp.png"/></a>&nbsp;
    </div>
    <div class="col">
      <label class="control-label d-none d-md-block" for="created" *ngIf="angelegt">Angelegt</label>
      <p class="form-control-static" title="Angelegt">{{angelegt}}</p>
    </div>
    <div class="col">
      <label class="control-label d-none d-md-block" for="changed" *ngIf="geaendert">Geändert</label>
      <p class="form-control-static" title="Geändert">{{geaendert}}</p>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Fz710Component implements OnInit {

  item: FzNotiz = { uid: '', thema: '', notiz: '' };
  angelegt: string;
  geaendert: string;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private actions$: Actions, private privateservice: PrivateService) {
    this.route.params.subscribe(
      params => this.privateservice.getMemo(params['id'])
        .then(a => {
          if (a != null) this.item = a;
          this.angelegt = Global.formatDatumVon(this.item.angelegtAm, this.item.angelegtVon) ?? '';
          if (!Global.nes(this.item.replid))
            this.angelegt += ' (' + this.item.replid + ')';
          this.geaendert = Global.formatDatumVon(this.item.geaendertAm, this.item.geaendertVon);
          if (Global.nes(this.item.uid))
            this.store.dispatch(GlobalActions.SetError('Notiz nicht gefunden.'));
        })
      //.finally(() => { if (Global.nes(this.item.uid)) this.store.dispatch(GlobalActions.SetError('Notiz nicht gefunden.')); })
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
