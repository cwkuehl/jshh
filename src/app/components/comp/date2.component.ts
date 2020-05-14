import { Component, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';
import { Global } from '../../services/global';

@Component({
  selector: 'app-date2',
  template: `
<div class="input-group">
  <input class="form-control" type="date" id="d" name="d"
    [ngModel]="seldate | date:'yyyy-MM-dd'" (ngModelChange)="onSeldateChange($event)"
    #d="ngModel" required pattern="\d{4}-\d{2}-\d{2}" [readonly]="readonly" required>
  <div class="input-group-append">
    <button class="btn btn-outline-secondary calendar" (click)="onChanged(-1)" type="button" title="Vorheriger Tag" [disabled]="readonly">-</button>
    <button class="btn btn-outline-secondary calendar" (click)="onChanged()" type="button" title="Heute" [disabled]="readonly">o</button>
    <button class="btn btn-outline-secondary calendar" (click)="onChanged(1)" type="button" title="Nächster Tag" [disabled]="readonly">+</button>
  </div>
</div>
  `,
  styles: [``],
  providers: [
  ]
})
export class Date2Component implements OnInit, OnChanges {

  @Output() dateChange = new EventEmitter<Date>();
  @Input('date') date: Date = Global.today();
  @Input('readonly') readonly: boolean = false;

  seldate: Date;

  constructor() {
  }

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    // console.log('ngOnChanges: ' + this.date);
    if (this.date == null) {
      this.seldate = Global.today();
    } else
      this.seldate = this.date;
  }

  ngOnInit() {
  }

  onSeldateChange(x: any) {
    if (typeof x === 'string') {
      this.seldate = Global.toDate(x);
      this.dateChange.next(new Date(this.seldate));
    }
  }

  public onChanged(t: number = 0, m: number = 0, j: number = 0) {
    var d = new Date(this.seldate);
    // var d = Global.date(this.seldate.getDate(), this.seldate.getMonth() + 1, this.seldate.getFullYear());
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
    this.seldate = d;
    this.dateChange.next(d);
  }
}

