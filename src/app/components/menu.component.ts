import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-menu',
  template: `
<div class="row navbar">
  <div class="col-sm-6 col-md-4">
    <a class="navbar-brand" href="#"><img src="favicon.ico" width="20px"> {{ title }}</a>
  </div>
  <div class="col-sm-3 col-md-2">
    <div ngbDropdown class="d-inline-block">
      <button class="btn btn-secondary" id="dd1" ngbDropdownToggle>Benutzer</button>
      <div ngbDropdownMenu aria-labelledby="dd1">
        <button ngbDropdownItem [routerLink]="'/login'">Anmeldung</button>
        <button ngbDropdownItem [routerLink]="'/options'">Einstellungen</button>
      </div>
    </div>
  </div>
  <div class="col-sm-3 col-md-2">
    <div ngbDropdown class="d-inline-block">
      <button class="btn btn-secondary" id="dd2" ngbDropdownToggle>Funkionen</button>
      <div ngbDropdownMenu aria-labelledby="dd2">
        <button ngbDropdownItem [routerLink]="'/diary'">Tagebuch</button>
        <button ngbDropdownItem [routerLink]="'/memos'">Notizen</button>
        <button ngbDropdownItem [routerLink]="'/bookings'">Buchungen</button>
        <button ngbDropdownItem>Sudoku</button>
      </div>
    </div>
  </div>

  <div class="col text-right">
  </div>
</div>
  `,
  styles: [``]
})
export class MenuComponent implements OnInit {
  title: string = '';

  constructor() { }

  ngOnInit() {
    this.title = 'JSHH ' + environment.date;
  }

}
