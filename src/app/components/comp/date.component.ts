import { Component, OnInit, Injectable, Output, Input, EventEmitter } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct, NgbDate, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Global } from '../../services/global';

@Component({
  selector: 'app-date',
  template: `
<div class="input-group">
  <input class="form-control" placeholder="yyyy-mm-dd" (focus)="openSelection(d)" name="d" [ngModel]="seldate" (ngModelChange)="onSeldateChange($event)" ngbDatepicker #d="ngbDatepicker" />
  <div class="input-group-append">
    <button class="btn btn-outline-secondary calendar" (click)="onChanged(-1)" type="button" title="Vorheriger Tag">-</button>
    <button class="btn btn-outline-secondary calendar" (click)="onChanged()" type="button" title="Heute">o</button>
    <button class="btn btn-outline-secondary calendar" (click)="onChanged(1)" type="button" title="Nächster Tag">+</button>
  </div>
</div>
  `,
  styles: [``],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class DateComponent implements OnInit {

  @Output() dateChange = new EventEmitter<Date>();
  @Input() date: Date;

  seldate: NgbDateStruct;

  constructor() {
    if (this.date == null) {
      this.seldate = this.today;
      //console.log("ngOnInit date == null");
    } else
      this.seldate = {year: this.date.getFullYear(), month: this.date.getMonth() + 1, day: this.date.getDate()};
  }

  ngOnInit() {
  }

  get today() {
    var d = Global.today();
    //return new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  openSelection(d: any) {
    if (this.seldate.month == 12)
      d.startDate = {year: this.seldate.year + 11, month: 1, day: this.seldate.day};
    else
      d.startDate = {year: this.seldate.year + 10, month: this.seldate.month + 1, day: 1};
    d.open();
    d.startDate = {year: this.seldate.year + 10, month: this.seldate.month, day: this.seldate.day};
    d.navigateTo({year: this.seldate.year, month: this.seldate.month, day: this.seldate.day});
  }

  onSeldateChange(x: any) {
    if (typeof x === 'string')
      return;
    //if (x instanceof Date) {
    //  //this.seldate = { year: x.getFullYear(), month: x.getMonth() + 1, day: x.getDate() };
    //  return;
    //} else
    this.seldate = x;
    var d = Global.date(this.seldate.day, this.seldate.month, this.seldate.year)
    // console.log("onSeldateChange " + d);
    this.dateChange.next(d);
  }

  public onChanged(t: number = 0, m: number = 0, j: number = 0) {
    var d = Global.date(this.seldate.day, this.seldate.month, this.seldate.year)
    if (t != 0) {
      d.setDate(d.getDate() + t);
    }
    if (m != 0) {
      d.setMonth(d.getMonth() + m);
    }
    if (j != 0) {
      d.setFullYear(d.getFullYear() + j);
    }
    if (t == 0 && m == 0 && j == 0)
      d = Global.today();
    this.seldate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    this.dateChange.next(d);
  }
}
