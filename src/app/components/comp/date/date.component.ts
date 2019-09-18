import { Component, OnInit , Injectable } from '@angular/core';
import {NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter} from '@ng-bootstrap/ng-bootstrap';
import { Global } from '../../../services/global';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.css'],
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class DateComponent implements OnInit {

  seldate: Date;

  constructor() {
    this.seldate = this.today;
  }

  ngOnInit() {
//    this.seldate = Global.today();
  }

  get today() {
    //return new Date();
    return Global.today();
  }
}
