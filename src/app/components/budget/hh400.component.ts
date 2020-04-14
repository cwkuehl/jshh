import { Component, OnInit } from '@angular/core';
import { HhBuchung } from 'src/app/apis';

@Component({
  selector: 'app-hh400',
  template: `
<h3>Buchungen</h3>

<div class="row">
<button type="button" class="btn btn-primary col-sm-2" (click)="replicate()" title="Notizen-Ablgeich mit Server">Server-Ablgeich</button>&nbsp;
<button type="button" class="btn btn-primary col-sm-2" (click)="delete()" title="Notizen löschen">Löschen</button>
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
  server: string;
  months: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  save() {
    ;
  }

  public delete() {
    // this.store.dispatch(GlobalActions.SetError(null));
    // this.privateservice.deleteAllMemosOb().subscribe(() => this.reload());
  }

  public replicate() {
    // this.store.dispatch(GlobalActions.SetError(null));
    // //this.privateservice.getMemoList('server').then(a => this.postServer(a))
    // //.catch(a => this.store.dispatch(GlobalActions.SetErrorGlobal(a)));
    // this.privateservice.postServer(this.memos);
  }
}
