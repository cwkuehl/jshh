import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hh400',
  template: `
<h3>Buchungen</h3>

<form>
  <div class="form-row">
    <div class="form-group col-sm-6">
      <label class="control-label" for="url">Replikation-URL</label>
      <input type="text" class="form-control" name="url" [(ngModel)]="server" placeholder="URL für Replikationsserver">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col-sm-6">
      <label class="control-label" for="months">Anzahl Monate</label>&nbsp;
      <input type="text" class="form-control" name="months" [(ngModel)]="months" title="Anzahl Monate">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <button type="submit" class="btn btn-primary" (click)="save()">Speichern</button>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Hh400Component implements OnInit {
  server: string;
  months: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  save() {
    ;
  }
}
