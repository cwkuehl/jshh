import { Component, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { Global } from '../../services/global';
import { SudokuService } from '../../services';
import { Router } from '@angular/router';
import { Sudoku } from '../../apis';

interface Wert {
  value: string;
  id: string;
}

@Component({
  selector: 'app-so100',
  template: `
  <h2>Sudoku</h2>
  <ng-template ngFor let-y [ngForOf]="indexy">
    <app-sudoku-zelle *ngFor="let x of indexx" x="{{x}}" y="{{y}}" rechts="{{x==maxx-1?'1':''}}" links="{{x%maxxw==0?'1':''}}" oben="{{y%maxyw==0?'1':''}}" unten="{{y==maxy-1?'1':''}}" [value]="werte[x+y*maxx].value" (changed)="onChanged($event)"></app-sudoku-zelle><br>
  </ng-template>
  <div class="row">
    <div class="col">
      <label class="control-label">Gefüllt: {{anzahl}}</label>
      <label class="control-label"><input type="checkbox" [(ngModel)]="diagonal" (change)="onDiagonal()" tooltip="Müssen die Diagonalen auch alle Zahlen enthalten? (Schüssler-Sudoku)">Diagonalen verschieden (Schüssler-Sudoku)</label>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <button class="btn btn-secondary" (click)="onZug()" title="Eine Zahl bestimmen und eintragen.">1 Zug</button>&nbsp;
      <button class="btn btn-secondary" (click)="onLoesen()" title="Alle Zahlen bestimmen und eintragen.">Lösen</button>&nbsp;
      <button class="btn btn-secondary" (click)="onTest()" title="Widersprechen sich die bisherigen Zahlen?">Widerspruch-Test</button>&nbsp;
      <button class="btn btn-secondary" (click)="onLeeren()" title="Alle Felder leeren.">Leeren</button>&nbsp;
      <button class="btn btn-secondary" (click)="onSpeichern()" title="Den aktuellen Stand speichern.">Speichern</button>&nbsp;
      <button class="btn btn-secondary" (click)="onReset()" title="Den gespeicherten Stand wiederherstellen.">Zurücksetzen</button>&nbsp;
    </div>
  </div>
  <div class="row">
    <div class="col">
      <label class="control-label">{{status}}</label>
    </div>
  </div>
  `,
  styles: [`
  `],
})
export class So100Component implements OnInit, AfterViewInit, AfterContentInit {

  private maxx: number = Global.SU_MAXX;
  private maxxw: number = Global.SU_MAXXW;
  private maxy: number = Global.SU_MAXX;
  private maxyw: number = Global.SU_MAXYW;

  private zahlen: number[] = [];
  private werte: Wert[] = [];
  public indexx: number[] = [];
  public indexy: number[] = [];
  public diagonal: boolean = true;
  public anzahl: number = 0;
  public status: string;

  constructor(private suservice: SudokuService, private router: Router) {
    this.zahlen = this.suservice.getZahlen();
    this.diagonal = this.suservice.getDiagonal();
    for (let x = 0; x < this.maxx; x++) {
      this.indexx.push(x);
    }
    for (let y = 0; y < this.maxy; y++) {
      this.indexy.push(y);
    }
    for (let i = 0; i < this.zahlen.length; i++) {
      let z = this.zahlen[i];
      let x = i % this.maxx;
      let y = (i - x) / this.maxx;
      this.werte.push({ value: z === 0 ? null : z.toString(), id: 'x' + x + 'y' + y });
    }
    if (this.maxxw === this.maxyw || this.diagonal) {
      this.maxxw = this.maxyw; // nicht verwendete Variablen
    }
  }

  ngOnInit() {
    this.status = null;
    this.anzahl = this.suservice.getAnzahl(this.zahlen);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit ' + this.inputliste); //.nativeElement.classList.add('isActive');
    setTimeout(function () {
      let f = document.getElementById('x0y0');
      if (f != null) {
        // console.log('focus: ' + f);
        window.focus();
        f.focus();
      }
    }, 0);
  }

  ngAfterContentInit() {
    // console.log('ngAfterContentInit ' + this.inputliste2); //.nativeElement.classList.add('isActive');
  }

  private onAktuell() {
    for (let i = 0; i < this.werte.length; i++) {
      let z = this.zahlen[i];
      this.werte[i].value = z <= 0 ? null : z.toString();
      let f: any = document.getElementById(this.werte[i].id);
      if (f != null) {
        // console.log('ID: ' + this.werte[i].id + ' f: ' + f.value);
        f.value = this.werte[i].value;
      }
    }
    this.anzahl = this.suservice.getAnzahl(this.zahlen);
    this.suservice.setSudoku(this.zahlen, this.diagonal);
  }

  /**
   * Sudoku lösen versuchen.
   * @param nur1Zug Soll nur 1 Zug berechnet werden?
   */
  private sudokuLoesenMeldung(nur1Zug: boolean) {
    try {
      this.status = null;
      this.suservice.sudokuLoesen(nur1Zug);
    } catch (ex) {
      this.status = ex.message;
    }
    this.onAktuell();
  }

  public onChanged(xyv: number) {
    let v = xyv % 10;
    let y = (xyv - v) / 10 % 10;
    let x = (xyv - y * 10 - v) / 100 % 10;
    if (0 <= x && x < this.maxx && 0 <= y && y < this.maxy) {
      this.zahlen[x + y * this.maxx] = v;
      this.suservice.setSudoku(this.zahlen, this.diagonal);
      this.anzahl = this.suservice.getAnzahl(this.zahlen);
    }
    // console.log('Changed: ' + x + ' ' + y + ' ' + v);
  }

  public onDiagonal() {
    // console.log('diagonal: ' + this.diagonal);
    this.suservice.setSudoku(this.zahlen, this.diagonal);
  }

  public onZug() {
    this.sudokuLoesenMeldung(true);
  }

  public onLoesen() {
    this.sudokuLoesenMeldung(false);
  }

  public onTest() {
    try {
      this.status = null;
      this.suservice.test();
    } catch (ex) {
      this.status = ex.message;
    }
  }

  public onLeeren() {
    for (let i = 0; i < this.zahlen.length; i++) {
      this.zahlen[i] = 0;
    }
    this.onAktuell();
  }

  public onSpeichern() {
    this.suservice.speichereStand('0', JSON.stringify({ zahlen: this.zahlen, diagonal: this.diagonal }));
  }

  public onReset() {
    let self = this;
    this.suservice.getStand('0').then((s: Sudoku) => {
      if (s == null || Global.nes(s.wert)) {
        return;
      }
      let stand = JSON.parse(s.wert);
      if (stand.hasOwnProperty('zahlen')) {
        self.zahlen = stand.zahlen;
      }
      if (stand.hasOwnProperty('diagonal')) {
        self.diagonal = stand.diagonal;
      }
      self.onAktuell();
    });
  }
}
