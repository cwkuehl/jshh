import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as TbEintragActions from '../../actions/tbeintrag.actions';
import { TbEintrag } from '../../apis';
import { AppState } from '../../app.state';
import { Global } from '../../services';
import { DiaryService } from '../../services/diary.service';

@Component({
  selector: 'app-tb100',
  templateUrl: './tb100.component.html',
  styleUrls: ['./tb100.component.css']
})
export class Tb100Component implements OnInit {

  diary: Observable<TbEintrag[]>;
  userId: string;

  date: Date;
  entry: string;
  angelegt: string;
  geaendert: string;
  private datumAlt: Date;
  private eintragAlt: string;
  private geladen: boolean;

  error: string = '';
  guid: string = '';

  constructor(private store: Store<AppState>, private actions$: Actions, private diaryservice: DiaryService) {
    this.diary = store.select('diary');
    store.select('userId').subscribe(x => this.userId = x);
    this.actions$.pipe(ofType<TbEintragActions.ErrorTbEintrag>(TbEintragActions.ERROR_TB_EINTRAG))
      .subscribe(a => this.error = a.payload);
    this.onUuid();
  }

  ngOnInit() {
    this.date = Global.today();
    this.bearbeiteEintraege(false, true); // Zuerst nur laden.
    //this.date.setDate(this.date.getDate() + 1);
    //this.entry = 'leeeeeer';
  }

  public onDateChange(datum: Date) {
    this.date = datum;
    //this.tbservice.setDatum(datum);
    // console.log('Datum: ' + this.datum + ' Eintrag: ' + this.eintrag + ' Alt: ' + this.datumAlt + ' Eintrag: ' + this.eintragAlt);
    this.bearbeiteEintraege(true, true);
  }

  createError() {
    this.store.dispatch(new TbEintragActions.ErrorTbEintrag('ErrorTbEintrag'));
  }

  onUuid(): void {
    this.guid = Global.getUID();
  }

  private ladeEintraege(datum: Date) {

    if (datum != null) {
      this.date = datum;
      this.diaryservice.getEintrag(this.date).then(e => {
        if (e == null) {
          this.eintragAlt = null;
          this.entry = null;
          this.angelegt = null;
          this.geaendert = null;
        } else {
          this.eintragAlt = e.eintrag;
          this.entry = e.eintrag;
          this.angelegt = Global.formatDatumVon(e.angelegtAm, e.angelegtVon);
          this.geaendert = Global.formatDatumVon(e.geaendertAm, e.geaendertVon);
        }
        this.datumAlt = new Date(this.date.getTime());
      });
    }
  }

  /**
 * Lesen der Einträge ausgehend vom aktuellen Datum. Evtl. wird vorher der aktuelle Eintrag gespeichert.
 * @param speichern True, wenn vorher gespeichert werden soll.
 * @param laden True, wenn Einträge geladen werden sollen.
 */
  private bearbeiteEintraege(speichern: boolean, laden: boolean) {

    this.error = null;
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
        this.store.dispatch(new TbEintragActions.SaveTbEintrag(
          { datum: this.datumAlt, eintrag: this.entry }));
      }
    }
    if (laden) {
      this.ladeEintraege(this.date);
      this.geladen = true;
    }
  }

  SaveTbEintrag(datum: string, eintrag: string) {
    this.store.dispatch(new TbEintragActions.SaveTbEintrag(
      { datum: Global.toDate(datum), eintrag: eintrag, angelegtAm: Global.now(), angelegtVon: this.userId }));
  }

  LoadTbEintrag(index: number) {
    this.store.dispatch(new TbEintragActions.LoadTbEintrag(index));
  }
}
