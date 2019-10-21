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
  templateUrl: './tb100.component.html',
  styleUrls: ['./tb100.component.css']
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
      ofType(TbEintragActions.LoadTbEintrag),
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

  handleError(err: HttpErrorResponse): string {
      //var errortype: string = err.error.constructor.toString().match(/\w+/g)[1];
      //var errorstring: string = (err.error instanceof ProgressEvent) ? 'PE' : err.error.toString();
      var msg: string = err.error.error ? err.error.error.message
        : (err.message + ((err.error instanceof ProgressEvent) ? '' : ` (${err.error})`));
      var msg2 = `Server error: ${err.statusText} (${err.status})  Details: ${msg}`;
      return msg2;
    }

  deleteDiary() {
    this.store.dispatch(TbEintragActions.ErrorTbEintrag(null));
    this.diaryservice.deleteAllOb().subscribe(() => this.ladeEintraege(this.date));
  }

  readServer() {
    if (Global.toInt(this.months) <= 0) {
      //this.store.dispatch(GlobalActions.SetErrorGlobal('Monate müssen größer 0 sein. Global'));
      this.store.dispatch(TbEintragActions.ErrorTbEintrag('Monate müssen größer 0 sein.'));
      return;
    }
    this.store.dispatch(TbEintragActions.ErrorTbEintrag(null));
    this.diaryservice.getTbEintragListe('server').then(a => this.readServer1(a))
    .catch(a => this.store.dispatch(TbEintragActions.ErrorTbEintrag(a)));
  }

  readServer1(arr: TbEintrag[]) {
    let m = Math.max(1, Global.toInt(this.months));
    let jarr = JSON.stringify({'TB_Eintrag': arr});
    this.diaryservice.postServer<TbEintrag[]>('TB_Eintrag', `read_${m}m`, jarr).subscribe(
      (a: TbEintrag[]) => {
        a.reverse().forEach((e: TbEintrag) => {
          //console.log(e.datum + ": " + e.eintrag);
          this.store.dispatch(TbEintragActions.SaveTbEintrag(e));
          this.store.dispatch(TbEintragActions.LoadTbEintrag());
        });
        //console.log("JSON Next: " + JSON.stringify(a));
      },
      (err: HttpErrorResponse) => {
        return this.store.dispatch(TbEintragActions.ErrorTbEintrag(this.handleError(err)));
      },
      //() => this.store.dispatch(TbEintragActions.LoadTbEintrag())
    );
    if (false) {
      //this.diaryservice.find().subscribe(a => console.log('json: ' + a)
      //  , err => this.store.dispatch(TbEintragActions.ErrorTbEintrag(`Server error: ${err.status} - Details: ${err.error}`)));
      this.diaryservice.postServer<FzNotiz[]>('FZ_Notiz', 'read', null).subscribe(
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
        this.store.dispatch(TbEintragActions.SaveTbEintrag(
          { datum: Global.toString(this.datumAlt), eintrag: this.entry, replid: null }));
        if (laden) {
          laden = false;
          this.store.dispatch(TbEintragActions.LoadTbEintrag());
        }
      }
    }
    if (laden) {
      this.ladeEintraege(this.date);
      this.geladen = true;
    }
  }
}
