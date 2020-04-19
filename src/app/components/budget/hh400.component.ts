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
<h3>Buchungen</h3>

<div class="row">
  <button type="button" class="btn btn-primary col" (click)="replicate()" title="Buchungen-Ablgeich mit Server">Server-Ablgeich</button>&nbsp;
  <button type="button" class="btn btn-primary col" (click)="delete()" title="Alle Buchungen löschen">Löschen</button>&nbsp;
  <button type="button" class="btn btn-primary col" (click)="newbooking()" title="Neue Buchung erstellen">Neu</button>
</div>

<div class="row card mt-1" *ngIf="bookings.length > 0">

<table class="table table-contensed" >
  <thead>
  <tr>
    <th>Nr.</th>
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
    <td><a [routerLink]="['/booking', item.uid]">{{item.uid}}</a></td>
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
      //.then(l => this.budgetservice.getBookingListJoin(l || []))
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
    this.router.navigate(['/', 'booking', ''])
      .then(nav => { console.log(nav); }, err => { console.log(err) });
  }
}
