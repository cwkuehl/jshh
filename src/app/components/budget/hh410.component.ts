import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
<h4>Buchung <small class="text-muted">{{title}}</small></h4>

<form>
  <div class="row">
    <div class="col-9">
      <label class="control-label d-none d-md-block" for="valuta">Valuta</label>
      <app-date2 [date]="item.sollValuta" title="Valuta der Buchung" id="valuta" (dateChange)="onValutaChange($event)"></app-date2>
    </div>
    <div class="col-3">
      <label class="control-label d-none d-md-block" for="betrag">Betrag</label>
      <input type="text" class="form-control" #betrag name="betrag" [ngModel]="item.ebetrag | number:'1.2-2'" title="Betrag" placeholder="Betrag">
    </div>
  </div>
  <div class="row">
    <div class="col">
      <label class="control-label d-none d-md-block" for="ereignis">Ereignis</label>
      <select class="form-control" name="ereignis" [ngModel]="eventuid" (ngModelChange)="onEreignisChange($event)" size="5" title="Ereignis" placeholder="Ereignis">
        <option *ngFor="let k of events" [value]="k.uid">{{ k.bezeichnung }}</option>
      </select>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <label class="control-label d-none d-md-block" for="sollkonto">Sollkonto</label>
      <select class="form-control" name="Sollkonto" [(ngModel)]="item.sollKontoUid" size="3" title="Sollkonto" placeholder="Sollkonto">
        <option *ngFor="let k of accounts" [value]="k.uid">{{ k.name }}</option>
      </select>
    </div>
    <div class="col">
      <label class="control-label d-none d-md-block" for="habenkonto">Habenkonto</label>
      <select class="form-control" name="Habenkonto" [(ngModel)]="item.habenKontoUid" size="3" title="Habenkonto" placeholder="Habenkonto">
        <option *ngFor="let k of accounts" [value]="k.uid">{{ k.name }}</option>
      </select>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <label class="control-label d-none d-md-block" for="btext">Buchungstext</label>
      <input type="text" class="form-control" name="btext" [(ngModel)]="item.btext" title="Buchungstext" placeholder="Buchungstext">
    </div>
  </div>
  <div class="row">
    <div class="col-3">
      <label class="control-label d-none d-md-block" for="belegnr">Belegnummer</label>
      <input type="text" class="form-control" name="belegnr" [(ngModel)]="item.belegNr" title="Belegnummer" placeholder="Belegnummer">
    </div>
    <div class="col-9">
      <label class="control-label d-none d-md-block" for="belegdatum">Belegdatum</label>
      <app-date2 [(date)]="item.belegDatum" title="Belegdatum" id="belegdatum"></app-date2>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <button type="submit" class="btn btn-primary" title="Schließen mit Speichern." (click)="save()"><img src="assets/icons/ic_save_white_24dp.png"/></button>&nbsp;
      <a class="btn btn-primary" title="Schließen ohne Speichern." [routerLink]="'/bookings'"><img src="assets/icons/ic_cancel_white_24dp.png"/></a>&nbsp;
    </div>
    <div class="col">
      <label class="control-label d-none d-md-block" for="created" *ngIf="angelegt">Angelegt</label>
      <p class="form-control-static" title="Angelegt">{{angelegt}}</p>
    </div>
    <div class="col">
      <label class="control-label d-none d-md-block" for="changed" *ngIf="geaendert">Geändert</label>
      <p class="form-control-static" title="Geändert">{{geaendert}}</p>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Hh410Component implements OnInit {
  title: string = 'Neu';
  item: HhBuchung = {
    uid: '', sollValuta: Global.today(), habenValuta: Global.today(), betrag: 0, ebetrag: 0,
    sollKontoUid: '', habenKontoUid: '', btext: '', belegDatum: Global.today()
  };
  angelegt: string;
  geaendert: string;
  eventuid: string;
  events: HhEreignis[] = [];
  accounts: HhKonto[] = [];

  @ViewChild("betrag") betragField: ElementRef;
  first: boolean = true;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private actions$: Actions,
    private budgetservice: BudgetService, private router: Router) {
    this.route.params.subscribe(
      params => {
        if (!Global.nes(params['id']))
          this.budgetservice.getBooking(params['id'])
            .then(a => {
              this.title = Global.nes(params['copy']) ? params['id'] : 'Kopieren';
              if (a != null) this.item = a;
              if (Global.nes(this.item.uid)) this.store.dispatch(GlobalActions.SetError('Buchung nicht gefunden.'));
              if (!Global.nes(params['copy'])) {
                this.item.uid = null;
                this.item.replid = null;
                this.item.angelegtAm = null;
                this.item.angelegtVon = null;
                this.item.geaendertAm = null;
                this.item.geaendertVon = null;
              }
              this.angelegt = Global.formatDatumVon(this.item.angelegtAm, this.item.angelegtVon) ?? '';
              if (!Global.nes(this.item.replid))
                this.angelegt += ' (' + this.item.replid + ')';
              this.geaendert = Global.formatDatumVon(this.item.geaendertAm, this.item.geaendertVon);
            })
        //.finally(() => { if (Global.nes(this.item.uid)) this.store.dispatch(GlobalActions.SetError('Buchung nicht gefunden.')); });
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
    this.item.sollValuta = datum;
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
    this.store.dispatch(GlobalActions.SetError(null));
    if (this.betragField != null) {
      this.item.ebetrag = Global.round(Global.toNumber(this.betragField.nativeElement.value), 2);
    }
    this.item.kz = 'A';
    var b = Object.assign({}, this.item); // Clone erzeugen
    b.sollValuta = Global.date2(b.sollValuta);
    b.habenValuta = Global.date2(b.habenValuta);
    b.belegDatum = Global.date2(b.belegDatum);
    b.replid = null;
    this.budgetservice.saveBooking(b)
      .then(() => this.router.navigate(['/', 'bookings']))
      .catch(ex => this.store.dispatch(GlobalActions.SetError(ex)));
  }
}
