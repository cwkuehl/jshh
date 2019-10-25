import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, asyncScheduler } from 'rxjs';
import * as TbEintragActions from '../../actions/tbeintrag.actions';
import * as GlobalActions from '../../actions/global.actions'
import { TbEintrag, FzNotiz } from '../../apis';
import { AppState } from '../../app.state';
import { Global } from '../../services/global';
import { DiaryService } from '../../services/diary.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-tb100',
  template: `
<h3>Tagebuch</h3>

<form>
  <div class="form-row">
    <div class="form-group col-sm-4 col-md-3">
      <label class="control-label d-none d-md-block" for="entrydate">Datum</label>
      <app-date [date]="date" title="Datum des Eintrags" id="entrydate" (dateChange)="onDateChange($event)"></app-date>
      <button type="button" class="btn btn-primary mt-3" (click)="save()">Speichern</button><br>
    </div>
    <div class="form-group col-sm-4 col-md-6">
      <label class="d-none d-md-block" for="eintrag">Eintrag</label>
      <textarea class="form-control" title="Tagebuch-Eintrag" id="eintrag" name="entry" [(ngModel)]="entry" rows="5" cols="20"></textarea>
    </div>
    <div class="form-group col-sm-4 col-md-3">
      <label class="control-label mt-3 d-none d-md-block" for="created" *ngIf="angelegt">Angelegt</label>
      <p class="form-control-static" title="Angelegt">{{angelegt}}</p>
      <label class="control-label d-none d-md-block" for="changed" *ngIf="geaendert">Geändert</label>
      <p class="form-control-static" title="Geändert">{{geaendert}}</p>
    </div>
  </div>
</form>

<div class="row">
  <label class="control-label col-sm-2 d-none d-md-block" for="months">Anzahl Monate</label>&nbsp;
  <input type="text" class="form-control col-sm-1" name="months" [(ngModel)]="months" title="Anzahl Monate">
  <label class="control-label col-sm-2 d-md-none d-lg-none d-xl-none" for="months"> Monat(e)</label>&nbsp;
  <button type="button" class="btn btn-primary col-sm-2" (click)="replicate()" title="Tagebuch-Ablgeich mit Server">Server-Ablgeich</button>&nbsp;
  <button type="button" class="btn btn-primary col-sm-2" (click)="delete()" title="Tagebuch löschen">Löschen</button>
</div>
  `,
  styles: [``]
})
export class Tb100Component implements OnInit {

  //diary: Observable<TbEintrag[]>;
  //userId: string;
  months: string;

  date: Date;
  entry: string;
  angelegt: string;
  geaendert: string;
  private datumAlt: Date;
  private eintragAlt: string;
  private geladen: boolean;

  constructor(private store: Store<AppState>, private actions$: Actions, private diaryservice: DiaryService) {
    //this.diary = store.select('diary');
    //store.select('userId').subscribe(x => this.userId = x);
    this.actions$.pipe(
      ofType(TbEintragActions.Load),
      throttleTime(100, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(() => this.ladeEintraege(this.date));
  }

  ngOnInit() {
    this.date = Global.today();
    this.bearbeiteEintraege(false, true); // Zuerst nur laden.
    this.months = '1';
  }

  public onDateChange(datum: Date) {
    this.date = datum;
    //this.tbservice.setDatum(datum);
    // console.log('Datum: ' + this.datum + ' Eintrag: ' + this.eintrag + ' Alt: ' + this.datumAlt + ' Eintrag: ' + this.eintragAlt);
    this.bearbeiteEintraege(true, true);
  }

  // createError() {
  //   this.store.dispatch(TbEintragActions.ErrorTbEintrag('ErrorTbEintrag'));
  // }

  delete() {
    this.store.dispatch(TbEintragActions.Error(null));
    this.diaryservice.deleteAllOb().subscribe(() => this.ladeEintraege(this.date));
  }

  replicate() {
    if (Global.toInt(this.months) <= 0) {
      //this.store.dispatch(GlobalActions.SetError('Monate müssen größer 0 sein. Global'));
      this.store.dispatch(TbEintragActions.Error('Monate müssen größer 0 sein.'));
      return;
    }
    this.store.dispatch(TbEintragActions.Error(null));
    this.diaryservice.getTbEintragListe('server').then(a => this.postReadServer(a))
    .catch(a => this.store.dispatch(TbEintragActions.Error(a)));
  }

  postReadServer(arr: TbEintrag[]) {
    let m = Math.max(1, Global.toInt(this.months));
    let jarr = JSON.stringify({'TB_Eintrag': arr});
    this.diaryservice.postServer<TbEintrag[]>('TB_Eintrag', `read_${m}m`, jarr).subscribe(
      (a: TbEintrag[]) => {
        a.reverse().forEach((e: TbEintrag) => {
          //console.log(e.datum + ": " + e.eintrag);
          this.store.dispatch(TbEintragActions.Save(e));
          this.store.dispatch(TbEintragActions.Load());
        });
        //console.log("JSON Next: " + JSON.stringify(a));
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(TbEintragActions.Error(Global.handleError(err)));
      },
      //() => this.store.dispatch(TbEintragActions.Load())
    );
    if (false) {
      //this.diaryservice.find().subscribe(a => console.log('json: ' + a)
      //  , err => this.store.dispatch(TbEintragActions.ErrorTbEintrag(`Server error: ${err.status} - Details: ${err.error}`)));
      this.diaryservice.postServer<FzNotiz[]>('FZ_Notiz', 'read', null).subscribe(
      (a: FzNotiz[]) => {
        console.log("JSON Next: " + JSON.stringify(a));
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(TbEintragActions.Error(Global.handleError(err)));
      },
      () => {
        // console.log("JSON: Ende");
      });
    }
  }

  private ladeEintraege(datum: Date) {

    if (datum != null) {
      this.date = datum;
      this.diaryservice.getEintrag(Global.toString(this.date)).then(e => {
        if (e == null) {
          this.eintragAlt = null;
          this.entry = null;
          this.angelegt = null;
          this.geaendert = null;
        } else {
          this.eintragAlt = e.eintrag;
          this.entry = e.eintrag;
          this.angelegt = Global.formatDatumVon(e.angelegtAm, e.angelegtVon) + ' (' + e.replid + ')';
          this.geaendert = Global.formatDatumVon(e.geaendertAm, e.geaendertVon);
        }
        this.datumAlt = new Date(this.date.getTime());
      });
    }
  }

  save() {
    this.bearbeiteEintraege(true, true);
  }

  /**
 * Lesen der Einträge ausgehend vom aktuellen Datum. Evtl. wird vorher der aktuelle Eintrag gespeichert.
 * @param speichern True, wenn vorher gespeichert werden soll.
 * @param laden True, wenn Einträge geladen werden sollen.
 */
  private bearbeiteEintraege(speichern: boolean, laden: boolean) {

    // Rekursion vermeiden
    if (speichern && this.geladen) {
      // alten Eintrag von vorher merken
      let alt = Global.trim(this.eintragAlt);
      let neu = Global.trim(this.entry);
      // nur speichern, wenn etwas geändert ist.
      if ((Global.nes(alt) !== Global.nes(neu)) || alt !== neu) {
        /////this.diaryservice.speichereEintrag(this.datumAlt, this.eintrag);
        // this.store.dispatch(new TbEintragActions.SaveTbEintrag(
        //   { datum: this.datumAlt, eintrag: this.entry, angelegtAm: Global.now(), angelegtVon: this.userId }));
        this.store.dispatch(TbEintragActions.Save(
          { datum: Global.toString(this.datumAlt), eintrag: this.entry, replid: null }));
        if (laden) {
          laden = false;
          this.store.dispatch(TbEintragActions.Load());
        }
      }
    }
    if (laden) {
      this.ladeEintraege(this.date);
      this.geladen = true;
    }
  }
}
