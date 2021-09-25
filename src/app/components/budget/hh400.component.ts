import { Component, OnInit } from '@angular/core';
import { HhBuchung } from 'src/app/apis';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { BudgetService } from 'src/app/services';
import * as HhBuchungActions from '../../actions/hhbuchung.actions';
import * as GlobalActions from '../../actions/global.actions';
import { throttleTime } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hh400',
  template: `
<h4>Buchungen</h4>

<div class="row">
  <div class="col">
    <button type="button" class="btn btn-primary" (click)="replicate()" title="Buchungen-Ablgeich mit Server"><img src="assets/icons/ic_cached_white_24dp.png"/></button>&nbsp;
    <button type="button" class="btn btn-primary" (click)="delete()" title="Alle Buchungen löschen"><img src="assets/icons/ic_delete_white_24dp.png"/></button>&nbsp;
    <button type="button" class="btn btn-primary" (click)="newbooking()" title="Neue Buchung erstellen"><img src="assets/icons/ic_add_box_white_24dp.png"/></button>&nbsp;
  </div>
</div>

<div class="row card" *ngIf="bookings.length>0">
<table class="table table-condensed" >
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
  <tr *ngFor="let item of bookings"> <!-- [class.active]="item === selectedFlight"> -->
    <td><div class="btn-group">
      <a class='btn btn-secondary' [routerLink]="['/booking', item.uid, '']" title='Details'><img src='assets/icons/ic_details_white_24dp.png' height='20px'/></a>
      <a class='btn btn-secondary' [routerLink]="['/booking', item.uid, 'copy']" title='Kopieren'><img src='assets/icons/ic_filter_2_white_24dp.png' height='20px'/></a>
      <button type='button' class='btn btn-secondary' title='Stornieren' (click)="reverse(item.uid)"><img src='assets/icons/ic_delete_white_24dp.png' height='20px'/></button>
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
export class Hh400Component implements OnInit {
  bookings: HhBuchung[] = [];

  constructor(private store: Store<AppState>, private actions$: Actions, private budgetservice: BudgetService, private router: Router) {
    this.actions$.pipe(
      ofType(HhBuchungActions.Load),
      throttleTime(100, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(() => this.reload());
    this.reload();
  }

  ngOnInit(): void {
  }

  public reload() {
    this.budgetservice.getBookingListJoin(null)
      .then(l => { this.bookings = l || []; })
      //.catch(e => this.store.dispatch(GlobalActions.SetError(e)));
      .catch(e => console.log(e));
  }

  public replicate() {
    this.store.dispatch(GlobalActions.SetError(null));
    this.budgetservice.getAccountList('server')
      .then(l => { this.budgetservice.postServerAccount(l || []); })
      .then(() => this.budgetservice.getEventList('server'))
      .then(l => { this.budgetservice.postServerEvent(l || []); })
      .then(() => this.budgetservice.getBookingList('server'))
      .then(l => { this.budgetservice.postServerBooking(l || []); })
      .catch(e => this.store.dispatch(GlobalActions.SetError(e)));
  }

  public delete() {
    if (!confirm('Sollen wirklich alle Buchungen gelöscht werden?'))
      return;
    this.store.dispatch(GlobalActions.SetError(null));
    this.budgetservice.deleteAllBookingsOb().subscribe(() => this.reload());
  }

  public newbooking() {
    this.router.navigate(['/', 'booking', '', ''])
      .then(nav => { console.log(nav); }, err => { console.log(err) });
  }

  public reverse(uid: string) {
    //if (!confirm('Soll die Buchung ' + uid + ' storniert werden?'))
    //  return;
    this.store.dispatch(GlobalActions.SetError(null));
    this.budgetservice.reverseBooking(uid).then(() => this.reload());
  }

}
