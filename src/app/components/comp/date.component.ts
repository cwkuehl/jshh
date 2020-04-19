import { Component, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { Global } from '../../services/global';

// /**
//  * This Service handles how the date is represented in scripts i.e. ngModel.
//  */
// @Injectable()
// export class CustomAdapter extends NgbDateAdapter<string> {

//   readonly DELIMITER = '-';

//   fromModel(value: string | null): NgbDateStruct | null {
//     if (value) {
//       let date = value.split(this.DELIMITER);
//       return {
//         day: parseInt(date[0], 10),
//         month: parseInt(date[1], 10),
//         year: parseInt(date[2], 10)
//       };
//     }
//     return null;
//   }

//   toModel(date: NgbDateStruct | null): string | null {
//     return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
//   }
// }

// /**
//  * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
//  */
// @Injectable()
// export class CustomDateParserFormatter extends NgbDateParserFormatter {

//   readonly DELIMITER = '/';

//   parse(value: string): NgbDateStruct | null {
//     if (value) {
//       let date = value.split(this.DELIMITER);
//       return {
//         day: parseInt(date[0], 10),
//         month: parseInt(date[1], 10),
//         year: parseInt(date[2], 10)
//       };
//     }
//     return null;
//   }

//   format(date: NgbDateStruct | null): string {
//     return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
//   }
// }

@Component({
  selector: 'app-date',
  template: `
<div class="input-group">
  <input class="form-control" placeholder="yyyy-mm-dd" (focus)="d.toggle()" name="d"
    [(ngModel)]="seldate" (ngModelChange)="onSeldateChange($event)" ngbDatepicker #d="ngbDatepicker" />
  <div class="input-group-append">
    <button class="btn btn-outline-secondary calendar" (click)="onChanged(-1)" type="button" title="Vorheriger Tag">-</button>
    <button class="btn btn-outline-secondary calendar" (click)="onChanged()" type="button" title="Heute">o</button>
    <button class="btn btn-outline-secondary calendar" (click)="onChanged(1)" type="button" title="Nächster Tag">+</button>
  </div>
</div>
  `,
  styles: [``],
  providers: [
    //{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
    //{ provide: NgbDateAdapter, useClass: CustomAdapter },
    //{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})
export class DateComponent implements OnInit, OnChanges {

  @Output() dateChange = new EventEmitter<Date>();
  @Input('date') date: Date = Global.today();

  seldate: NgbDateStruct;

  constructor(private calendar: NgbCalendar) {
    // if (this.date == null) {
    //   //this.seldate = this.today;
    //   this.seldate = this.calendar.getToday();
    // } else
    //   this.seldate = { year: this.date.getFullYear(), month: this.date.getMonth() + 1, day: this.date.getDate() };
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    // console.log('ngOnChanges: ' + this.date);
    if (this.date == null) {
      this.seldate = this.calendar.getToday();
    } else
      this.seldate = { year: this.date.getFullYear(), month: this.date.getMonth() + 1, day: this.date.getDate() };
  }

  ngOnInit() {
  }

  // get today() {
  //   var d = Global.today();
  //   //return new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  //   return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  // }

  openSelection(d: any) {
    // if (this.seldate.month == 12)
    //   d.startDate = {year: this.seldate.year + 11, month: 1, day: this.seldate.day};
    // else
    //   d.startDate = {year: this.seldate.year + 10, month: this.seldate.month + 1, day: 1};
    d.open();
    d.startDate = { year: this.seldate.year + 10, month: this.seldate.month, day: this.seldate.day };
    d.navigateTo({ year: this.seldate.year, month: this.seldate.month, day: this.seldate.day });
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
