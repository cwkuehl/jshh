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

@Component({
  selector: 'app-hh400',
  template: `
<h3>Buchungen</h3>

<div class="row">
<button type="button" class="btn btn-primary col-sm-2" (click)="replicate()" title="Buchungen-Ablgeich mit Server">Server-Ablgeich</button>&nbsp;
<button type="button" class="btn btn-primary col-sm-2" (click)="delete()" title="Alle Buchungen löschen">Löschen</button>
</div>

<div class="row card mt-1" *ngIf="bookings.length > 0">

<table class="table table-contensed" >
  <thead>
  <tr>
    <th>Nr.</th>
    <th>Thema</th>
    <th>Geändert am</th>
    <th>Geändert von</th>
    <th>Angelegt am</th>
    <th>Angelegt von</th>
  </tr>
  </thead>
  <tr *ngFor="let item of bookings"> <!-- [class.active]="item === selectedFlight"> -->
    <td><a [routerLink]="['/booking', item.uid]">{{item.uid}}</a></td>
    <td>{{item.btext}}</td>
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

  constructor(private store: Store<AppState>, private actions$: Actions, private budgetservice: BudgetService) {
    this.actions$.pipe(
      ofType(HhBuchungActions.Load),
      throttleTime(100, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(() => this.reload());
    this.reload();
  }

  ngOnInit(): void {
  }

  public reload() {
    this.budgetservice.getBookingList(null).then(l => { if (l != null) this.bookings = l; });
  }

  public delete() {
    this.store.dispatch(GlobalActions.SetError(null));
    this.budgetservice.deleteAllBookingsOb().subscribe(() => this.reload());
  }

  public replicate() {
    this.store.dispatch(GlobalActions.SetError(null));
    this.budgetservice.postServer(this.bookings);
  }
}
