import { Component, OnInit , Injectable } from '@angular/core';
import {NgbDateAdapter, NgbDateStruct, NgbDate, NgbDateNativeAdapter} from '@ng-bootstrap/ng-bootstrap';
import { Global } from '../../../services/global';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.css'],
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class DateComponent implements OnInit {

  seldate: NgbDateStruct;

  constructor() {
    this.seldate = this.today;
  }

  ngOnInit() {
//    this.seldate = Global.today();
  }

  get today() {
    var d = Global.today();
    //return new Date();
    return new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }
}
