import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as GlobalActions from '../../actions/global.actions';
import { HhBuchung, HhKonto, HhEreignis } from '../../apis';
import { AppState } from '../../app.state';
import { BudgetService } from '../../services';
import { Global } from '../../services/global';

@Component({
  selector: 'app-hh410',
  template: `
<h3>Buchung</h3>

<form>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="valuta">Valuta</label>
      <app-date [date]="item.sollValuta" title="Valuta der Buchung" id="valuta" (dateChange)="onValutaChange($event)"></app-date>
    </div>
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="betrag">Betrag</label>
      <input type="text" class="form-control" #betrag name="betrag" [ngModel]="item.ebetrag | number:'1.2-2'" title="Betrag" placeholder="Betrag">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="ereignis">Ereignis</label>
      <select class="form-control" name="ereignis" [ngModel]="eventuid" (ngModelChange)="onEreignisChange($event)" size="5" title="Ereignis" placeholder="Ereignis">
        <option *ngFor="let k of events" [value]="k.uid">{{ k.bezeichnung }}</option>
      </select>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="sollkonto">Sollkonto</label>
      <select class="form-control" name="Sollkonto" [(ngModel)]="item.sollKontoUid" size="5" title="Sollkonto" placeholder="Sollkonto">
        <option *ngFor="let k of accounts" [value]="k.uid">{{ k.name }}</option>
      </select>
    </div>
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="habenkonto">Habenkonto</label>
      <select class="form-control" name="Habenkonto" [(ngModel)]="item.habenKontoUid" size="5" title="Habenkonto" placeholder="Habenkonto">
        <option *ngFor="let k of accounts" [value]="k.uid">{{ k.name }}</option>
      </select>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="btext">Buchungstext</label>
      <input type="text" class="form-control" name="btext" [(ngModel)]="item.btext" title="Buchungstext" placeholder="Buchungstext">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="belegnr">Belegnummer</label>
      <input type="text" class="form-control" name="belegnr" [(ngModel)]="item.belegNr" title="Belegnummer" placeholder="Belegnummer">
    </div>
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="belegdatum">Belegdatum</label>
      <app-date [(date)]="item.belegDatum" title="Belegdatum" id="belegdatum"></app-date>
    </div>
  </div>
  <div class="form-row">
    <button type="submit" class="btn btn-primary col-sm-2" title="Schließen mit Speichern." (click)="save()">Speichern</button>
    <a class="btn btn-primary col-sm-2 ml-1" title="Schließen ohne Speichern." [routerLink]="'/bookings'">Abbrechen</a>
  </div>
</form>
  `,
  styles: [``]
})
export class Hh410Component implements OnInit {

  item: HhBuchung = {
    uid: '', sollValuta: Global.today(), habenValuta: Global.today(), betrag: 0, ebetrag: 0,
    sollKontoUid: '', habenKontoUid: '', btext: '', belegDatum: Global.today()
  };
  eventuid: string;
  events: HhEreignis[] = [];
  accounts: HhKonto[] = [];

  @ViewChild("betrag") betragField: ElementRef;
  first: boolean = true;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private actions$: Actions, private budgetservice: BudgetService) {
    this.route.params.subscribe(
      params => {
        if (!Global.nes(params['id']))
          this.budgetservice.getBooking(params['id'])
            .then(a => { if (a != null) this.item = a; })
            .finally(() => { if (Global.nes(this.item.uid)) this.store.dispatch(GlobalActions.SetError('Buchung nicht gefunden.')); });
        this.budgetservice.getEventList(null).then(l => this.events = l || []);
        this.budgetservice.getAccountList(null).then(l => this.accounts = l || []);
      }
    );
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.betragField != null) {
        this.betragField.nativeElement.focus();
        this.betragField.nativeElement.setSelectionRange(0, this.betragField.nativeElement.value.length);
      }
    }, 10);
  }

  public onValutaChange(datum: Date) {
    this.item.habenValuta = datum;
    this.item.belegDatum = datum;
  }

  public onEreignisChange(uid: string) {
    var e = this.events.find(a => a.uid == uid);
    if (e != null) {
      this.item.sollKontoUid = e.sollKontoUid;
      this.item.habenKontoUid = e.habenKontoUid;
      this.item.btext = e.etext;
    }
  }

  public delete() {
    this.store.dispatch(GlobalActions.SetError(null));
    //this.privateservice.deleteAllMemosOb().subscribe(() => this.reload());
  }

  public save() {
    if (this.betragField != null) {
      this.item.ebetrag = Global.round(Global.toNumber(this.betragField.nativeElement.value), 2);
    }
  }
}
