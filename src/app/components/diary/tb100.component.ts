import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as TbEintragActions from '../../actions/tbeintrag.actions';
import { TbEintrag, FzNotiz } from '../../apis';
import { AppState } from '../../app.state';
import { Global } from '../../services/global';
import { DiaryService } from '../../services/diary.service';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';

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
    this.actions$.pipe(ofType(TbEintragActions.ErrorTbEintrag))
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
    this.store.dispatch(TbEintragActions.ErrorTbEintrag('ErrorTbEintrag'));
  }

  handleError(err: HttpErrorResponse): string {
      //var errortype: string = err.error.constructor.toString().match(/\w+/g)[1];
      //var errorstring: string = (err.error instanceof ProgressEvent) ? 'PE' : err.error.toString();
      var msg: string = err.error.error ? err.error.error.message
        : (err.message + ((err.error instanceof ProgressEvent) ? '' : ` (${err.error})`));
      var msg2 = `Server error: ${err.statusText} (${err.status})  Details: ${msg}`;
      return msg2;
    }

  json() {
    this.diaryservice.postServer<TbEintrag[]>('TB_Eintrag', 'read').subscribe(
      (a: TbEintrag[]) => {
        console.log("JSON Next: " + JSON.stringify(a));
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(TbEintragActions.ErrorTbEintrag(this.handleError(err)));
      },
    );
    //this.diaryservice.find().subscribe(a => console.log('json: ' + a)
    //  , err => this.store.dispatch(TbEintragActions.ErrorTbEintrag(`Server error: ${err.status} - Details: ${err.error}`)));
    this.diaryservice.postServer<FzNotiz[]>('FZ_Notiz', 'read').subscribe(
    (a: FzNotiz[]) => {
      console.log("JSON Next: " + JSON.stringify(a));
    },
    (err: HttpErrorResponse) => {
      return this.store.dispatch(TbEintragActions.ErrorTbEintrag(this.handleError(err)));
    },
    () => {
      // console.log("JSON: Ende");
    });
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
        this.store.dispatch(TbEintragActions.SaveTbEintrag(
          { datum: this.datumAlt, eintrag: this.entry }));
      }
    }
    if (laden) {
      this.ladeEintraege(this.date);
      this.geladen = true;
    }
  }
}
