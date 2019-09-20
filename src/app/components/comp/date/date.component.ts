import { Component, OnInit, Injectable, Output, Input, EventEmitter } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct, NgbDate, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Global } from '../../../services/global';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class DateComponent implements OnInit {

  @Output() dateChanged: EventEmitter<Date> = new EventEmitter<Date>();
  @Input() public date: Date;

  seldate: NgbDateStruct;

  constructor() {
  }

  ngOnInit() {
    if (this.date == null) {
      this.seldate = this.today;
      console.log("ngOnInit date == null");
    } else
      this.seldate = {year: this.date.getFullYear(), month: this.date.getMonth() + 1, day: this.date.getDate()};
  }

  get today() {
    var d = Global.today();
    //return new Date();
    return new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
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

  public onChanged(t: number = 0, m: number = 0, j: number = 0) {
    var d = Global.date(this.seldate.day, this.seldate.month, this.seldate.year)
    if (t !== 0) {
      d.setDate(d.getDate() + t);
    }
    if (m !== 0) {
      d.setMonth(d.getMonth() + m);
    }
    if (j !== 0) {
      d.setFullYear(d.getFullYear() + j);
    }
    if (t == 0 && m == 0 && j == 0)
      d = Global.today();
    this.seldate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    this.dateChanged.emit(d);
  }
}
