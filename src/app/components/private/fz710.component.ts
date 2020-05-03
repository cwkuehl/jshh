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
    <div class="form-group col">
      <!--button type="submit" class="btn btn-primary ml-1" title="Schließen mit Speichern." (click)="save()"><img src="assets/icons/ic_save_white_24dp.png"/></button-->
      <a class="btn btn-primary ml-1" title="Schließen ohne Speichern." [routerLink]="'/memos'"><img src="assets/icons/ic_cancel_white_24dp.png"/></a>
    </div>
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
        .then(a => {
          if (a != null)
            this.item = a;
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
