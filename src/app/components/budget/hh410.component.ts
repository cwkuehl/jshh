import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as GlobalActions from '../../actions/global.actions';
import { HhBuchung } from '../../apis';
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
      <!--input type="text" class="form-control" #betrag name="betrag" [ngModel]="item.ebetrag" (ngModelChange)="item.ebetrag=$event" title="Betrag" placeholder="Betrag"-->
      <input type="text" class="form-control" #betrag name="betrag" [ngModel]="item.ebetrag | number:'1.2-2'" title="Betrag" placeholder="Betrag">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="btext">Buchungstext</label>
      <textarea class="form-control" name="btext" [(ngModel)]="item.btext" rows="5" cols="20" title="Buchungstext" placeholder="Buchungstext"></textarea>
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
export class Hh410Component implements OnInit, AfterViewChecked {

  item: HhBuchung = {
    uid: '', sollValuta: Global.today(), habenValuta: Global.today(), betrag: 0, ebetrag: 0,
    sollKontoUid: '', habenKontoUid: '', btext: '', belegDatum: Global.today()
  };

  @ViewChild("betrag") betragField: ElementRef;
  first: boolean = true;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private actions$: Actions, private budgetservice: BudgetService) {
    this.route.params.subscribe(
      params => {
        if (!Global.nes(params['id']))
          this.budgetservice.getBooking(params['id'])
            .then(a => { if (a != null) this.item = a; })
            .finally(() => { if (Global.nes(this.item.uid)) this.store.dispatch(GlobalActions.SetError('Buchung nicht gefunden.')); });
        // this.first = true;
        // this.ngAfterViewChecked();
      }
    );
  }

  ngAfterViewChecked(): void {
    // if (this.first) {
    //   this.first = false;
    //   if (this.betragField != null) {
    //     setTimeout(() => {
    //       this.betragField.nativeElement.focus();
    //       this.betragField.nativeElement.setSelectionRange(0, this.betragField.nativeElement.value.length);
    //     }, 100);
    //   }
    // }
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
    //this.tbservice.setDatum(datum);
    // console.log('Datum: ' + this.datum + ' Eintrag: ' + this.eintrag + ' Alt: ' + this.datumAlt + ' Eintrag: ' + this.eintragAlt);
    //this.bearbeiteEintraege(true, true);
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
