import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { asyncScheduler } from 'rxjs';
import * as TbEintragActions from '../../actions/tbeintrag.actions';
import { AppState } from '../../app.state';
import { Global } from '../../services/global';
import { DiaryService } from '../../services/diary.service';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-tb100',
  template: `
<h4>Tagebuch</h4>

<form>
  <div class="row">
    <div class="form-group col">
      <button type="button" class="btn btn-primary" title="Tagebuch-Ablgeich mit Server" (click)="replicate()"><img src="assets/icons/ic_cached_white_24dp.png"/></button>&nbsp;
      <button type="button" class="btn btn-primary" title="Tagebuch löschen" (click)="delete()"><img src="assets/icons/ic_delete_white_24dp.png"/></button>&nbsp;
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col">
      <label class="control-label d-none d-md-block" for="entrydate">Datum</label>
      <app-date2 [date]="date" title="Datum des Eintrags" id="entrydate" (dateChange)="onDateChange($event)"></app-date2>
    </div>
  </div>
  <div class="form-row">
      <div class="form-group col">
      <label class="d-none d-md-block" for="eintrag">Eintrag</label>
      <textarea class="form-control" title="Tagebuch-Eintrag" id="eintrag" name="entry" [(ngModel)]="entry" rows="8" cols="20"></textarea>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col-4">
      <button type="button" class="btn btn-primary" title="Eintrag speichern" (click)="save()"><img src="assets/icons/ic_save_white_24dp.png"/></button>&nbsp;
    </div>
    <div class="form-group col-4">
      <label class="control-label mt-1 d-none d-md-block" for="created" *ngIf="angelegt">Angelegt</label>
      <p class="form-control-static" title="Angelegt">{{angelegt}}</p>
    </div>
    <div class="form-group col-4">
      <label class="control-label d-none d-md-block" for="changed" *ngIf="geaendert">Geändert</label>
      <p class="form-control-static" title="Geändert">{{geaendert}}</p>
    </div>
  </div>
</form>
  `,
  styles: [``]
})
export class Tb100Component implements OnInit {

  date: Date;
  entry: string;
  angelegt: string;
  geaendert: string;
  private datumAlt: Date;
  private eintragAlt: string;
  private geladen: boolean;

  constructor(private store: Store<AppState>, private actions$: Actions, private diaryservice: DiaryService) {
    this.actions$.pipe(
      ofType(TbEintragActions.Load),
      throttleTime(100, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(() => this.ladeEintraege(this.date));
  }

  ngOnInit() {
    this.date = Global.today();
    this.bearbeiteEintraege(false, true); // Zuerst nur laden.
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
    if (!confirm('Sollen wirklich alle Einträge gelöscht werden?'))
      return;
    this.store.dispatch(TbEintragActions.Error(null));
    this.diaryservice.deleteAllOb().subscribe(() => this.ladeEintraege(this.date));
  }

  replicate() {
    this.store.dispatch(TbEintragActions.Error(null));
    this.diaryservice.getTbEintragListe('server').then(a => this.diaryservice.postServer(a))
      .catch(a => this.store.dispatch(TbEintragActions.Error(a)));
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
