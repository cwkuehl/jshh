import { Component, OnInit , Injectable } from '@angular/core';
import {NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.css'],
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class DateComponent implements OnInit {

  model2: Date;

  constructor() { }

  ngOnInit() {
  }

  get today() {
    return new Date();
  }
}
