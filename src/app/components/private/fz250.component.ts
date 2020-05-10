import { Component, OnInit } from '@angular/core';
import { FzFahrrad, FzFahrradstand } from 'src/app/apis';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { PrivateService } from 'src/app/services';
import * as FzFahrradActions from '../../actions/fzfahrrad.actions';
import * as GlobalActions from '../../actions/global.actions';
import { throttleTime } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fz250',
  template: `
<h4>Fahrradstände</h4>

<div class="row">
  <div class="form-group col">
    <button type="button" class="btn btn-primary ml-1" (click)="replicate()" title="Fahrradstände-Ablgeich mit Server"><img src="assets/icons/ic_cached_white_24dp.png"/></button>&nbsp;
    <button type="button" class="btn btn-primary ml-1" (click)="deleteall()" title="Alle Fahrradstände löschen"><img src="assets/icons/ic_delete_white_24dp.png"/></button>&nbsp;
    <button type="button" class="btn btn-primary ml-1" (click)="newmileage()" title="Neuen Fahrradstand erstellen"><img src="assets/icons/ic_add_box_white_24dp.png"/></button>
  </div>
</div>

<div class="row card mt-1" *ngIf="mileages.length > 0">

<table class="table table-contensed" >
  <thead>
  <tr>
    <th>Aktionen</th>
    <th>Valuta</th>
    <th>K.</th>
    <th class='text-right'>Betrag</th>
    <th>Buchungstext</th>
    <th>Sollkonto</th>
    <th>Habenkonto</th>
    <th>Beleg</th>
    <th>Geändert am</th>
    <th>Geändert von</th>
    <th>Angelegt am</th>
    <th>Angelegt von</th>
  </tr>
  </thead>
  <tr *ngFor="let item of mileages">
    <td><div class="btn-group">
      <a class='btn btn-secondary' [routerLink]="['/booking', item.uid, '']" title='Details'><img src='assets/icons/ic_details_white_24dp.png' height='20px'/></a>
      <a class='btn btn-secondary' [routerLink]="['/booking', item.uid, 'copy']" title='Kopieren'><img src='assets/icons/ic_filter_2_white_24dp.png' height='20px'/></a>
      <button type='button' class='btn btn-secondary' title='Löschen' (click)="delete(item.uid)"><img src='assets/icons/ic_delete_white_24dp.png' height='20px'/></button>
    </div></td>
    <td>{{item.sollValuta | date:'yyyy-MM-dd'}}</td>
    <td>{{item.kz}}</td>
    <td class='text-right'>{{item.ebetrag | number:'1.2'}}</td>
    <td>{{item.btext}}</td>
    <td>{{item.sollKontoName}}</td>
    <td>{{item.habenKontoName}}</td>
    <td>{{item.belegNr}}</td>
    <td>{{item.geaendertAm | date:'yyyy-MM-ddTHH:mm:ss'}}</td>
    <td>{{item.geaendertVon}}</td>
    <td>{{item.angelegtAm | date:'yyyy-MM-ddTHH:mm:ss'}}</td>
    <td>{{item.angelegtVon}}</td>
  </tr>
</table>
</div>
`,
  styles: [``]
})
export class Fz250Component implements OnInit {
  bikes: FzFahrrad[] = [];
  mileages: FzFahrradstand[] = [];

  constructor(private store: Store<AppState>, private actions$: Actions, private privateservice: PrivateService, private router: Router) {
    this.actions$.pipe(
      ofType(FzFahrradActions.Load),
      throttleTime(100, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(() => this.reload());
    this.reload();
  }

  ngOnInit(): void {
  }

  public reload() {
    this.privateservice.getBikeList(null)
      //.then(l => this.budgetservice.getBookingListJoin(l || []))
      .then(l => { this.bikes = l || []; this.mileages = []; })
      //.catch(e => this.store.dispatch(GlobalActions.SetError(e)));
      .catch(e => console.log(e));
  }

  public replicate() {
    this.store.dispatch(GlobalActions.SetError(null));
    this.privateservice.getBikeList('server')
      .then(l => { this.privateservice.postServerBike(l || []); })
      //.then(() => this.budgetservice.getBookingList('server'))
      //.then(l => { this.budgetservice.postServerBooking(l || []); })
      .catch(e => this.store.dispatch(GlobalActions.SetError(e)));
  }

  public deleteall() {
    if (!confirm('Sollen wirklich alle Stände gelöscht werden?'))
      return;
    this.store.dispatch(GlobalActions.SetError(null));
    this.privateservice.deleteAllMileagesOb().subscribe(() => this.reload());
  }

  public newmileage() {
    this.router.navigate(['/', 'booking', '', ''])
      .then(nav => { console.log(nav); }, err => { console.log(err) });
  }

  public delete(uid: string) {
    // this.store.dispatch(GlobalActions.SetError(null));
    // this.privateservice.reverseBooking(uid).then(() => this.reload());
  }

}
