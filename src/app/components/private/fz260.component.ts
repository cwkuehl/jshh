import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as GlobalActions from '../../actions/global.actions';
import { FzFahrradstand, FzFahrrad } from '../../apis';
import { AppState } from '../../app.state';
import { PrivateService } from '../../services';
import { Global } from '../../services/global';

@Component({
  selector: 'app-fz260',
  template: `
<h4>Fahrradstand <small class="text-muted">{{title}}</small></h4>

<form>
  <div class="form-row">
  <div class="form-group col-5">
      <label class="control-label d-none d-md-block" for="fahrrad">Fahrrad</label>
      <select class="form-control" name="fahrrad" [(ngModel)]="item.fahrradUid" size="1" title="Fahrrad" placeholder="Fahrrad auswählen">
        <option *ngFor="let k of bikes" [value]="k.uid">{{ k.bezeichnung }}</option>
      </select>
    </div>
    <div class="form-group col-7">
      <label class="control-label d-none d-md-block" for="datum">Datum</label>
      <app-date2 [date]="item.datum" title="Datum des Standes" id="datum" (dateChange)="onDatumChange($event)"></app-date2>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col-4">
      <label class="control-label d-none d-md-block" for="zaehler">Zähler</label>
      <input type="text" class="form-control" #zaehler name="zaehler" [ngModel]="item.zaehlerKm | number:'1.0-2'" title="Zählerstand" placeholder="Zählerstand">
    </div>
    <div class="form-group col-4">
      <label class="control-label d-none d-md-block" for="km">Km</label>
      <input type="text" class="form-control" #km name="km" [ngModel]="item.periodeKm | number:'1.0-2'" title="Tages- oder Wochen-Km" placeholder="Tages- oder Wochen-Km">
    </div>
    <div class="form-group col-4">
      <label class="control-label d-none d-md-block" for="schnitt">Schnitt</label>
      <input type="text" class="form-control" #schnitt name="schnitt" [ngModel]="item.periodeSchnitt | number:'1.0-2'" title="Durchschnittsgeschwindigkeit" placeholder="Durchschnittsgeschwindigkeit">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="beschreibung">Beschreibung</label>
      <input type="text" class="form-control" name="beschreibung" [(ngModel)]="item.beschreibung" title="Beschreibung" placeholder="Beschreibung">
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label mt-3 d-none d-md-block" for="created" *ngIf="angelegt">Angelegt</label>
      <p class="form-control-static" title="Angelegt">{{angelegt}}</p>
    </div>
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="changed" *ngIf="geaendert">Geändert</label>
      <p class="form-control-static" title="Geändert">{{geaendert}}</p>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <button type="submit" class="btn btn-primary ml-1" title="Schließen mit Speichern." (click)="save()"><img src="assets/icons/ic_save_white_24dp.png"/></button>
      <a class="btn btn-primary ml-1" title="Schließen ohne Speichern." [routerLink]="'/mileages'"><img src="assets/icons/ic_cancel_white_24dp.png"/></a>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Fz260Component implements OnInit {
  title: string = 'Neu';
  item: FzFahrradstand = {
    fahrradUid: '', datum: Global.toString(Global.today()), nr: 0, zaehlerKm: 0, periodeKm: 0,
    periodeSchnitt: 0, beschreibung: ''
  };
  angelegt: string;
  geaendert: string;
  eventuid: string;
  bikes: FzFahrrad[] = [];

  @ViewChild("km") kmField: ElementRef;
  @ViewChild("zaehler") zaehlerField: ElementRef;
  first: boolean = true;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private actions$: Actions,
    private privateservice: PrivateService, private router: Router) {
    this.route.params.subscribe(
      params => {
        if (!Global.nes(params['id']))
          this.privateservice.getMileage(params['id'], params['date'], Global.toInt(params['nr']))
            .then(a => {
              this.title = Global.nes(params['copy']) ? params['nr'] : 'Kopieren';
              if (a != null) this.item = a;
              if (Global.nes(this.item.fahrradUid)) this.store.dispatch(GlobalActions.SetError('Fahrradstand nicht gefunden.'));
              if (!Global.nes(params['copy'])) {
                //this.item.uid = null;
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
        this.privateservice.getBikeList(null).then(l => this.bikes = l || []);
      }
    );
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.kmField != null) {
        this.kmField.nativeElement.focus();
        this.kmField.nativeElement.setSelectionRange(0, this.kmField.nativeElement.value.length);
      }
    }, 50);
  }

  public onDatumChange(datum: Date) {
    this.item.datum = Global.toString(datum);
  }

  public delete() {
    this.store.dispatch(GlobalActions.SetError(null));
    //this.privateservice.deleteAllMemosOb().subscribe(() => this.reload());
  }

  public save() {
    this.store.dispatch(GlobalActions.SetError(null));
    if (this.kmField != null) {
      this.item.periodeKm = Global.round(Global.toNumber(this.kmField.nativeElement.value), 2);
    }
    if (this.zaehlerField != null) {
      this.item.zaehlerKm = Global.round(Global.toNumber(this.zaehlerField.nativeElement.value), 2);
    }
    var b = Object.assign({}, this.item); // Clone erzeugen
    b.replid = null;
    this.privateservice.saveMileage(b)
      .then(() => this.router.navigate(['/', 'mileages']))
      .catch(ex => this.store.dispatch(GlobalActions.SetError(ex)));
  }
}
