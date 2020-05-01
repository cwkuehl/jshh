import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Global } from '../../services/global';

@Component({
  selector: 'app-sudoku-zelle',
  template: `
    <input class="s" [class.sr]="rechts" [class.sl]="links" [class.st]="oben" [class.sb]="unten" id="x{{x}}y{{y}}" [(ngModel)]="value" maxlength="1" (keypress)="onKey($event)"/>
  `,
  styles: [`
  .s {
    width: 30px;
    height: 30px;
    text-align: center;
    border-color: gray;
    border-radius: 0;
    border-style: solid;
    border-width: 0 1px 1px 0;
    color: black;
    font-weight: 900;
    font-size: 200%;
    margin-right: -5px;
    /*margin-bottom: 8px;*/
  }
  .s:hover {
    background-color: green;
    cursor: pointer;
  }
  .s:focus {
    background-color: lightgray;
    cursor: none;
  }
  .sr {
    border-right-color: black;
    border-right-width: 3px;
  }
  .sl {
    border-left-color: black;
    border-left-width: 3px;
  }
  .st {
    border-top-color: black;
    border-top-width: 3px;
  }
  .sb {
    border-bottom-color: black;
    border-bottom-width: 3px;
  }
  `],
  providers: []
})
export class CellComponent implements OnInit {
  @Output() changed: EventEmitter<number> = new EventEmitter<number>();
  @Input() public x: number | string;
  @Input() public y: number | string;
  @Input() public value: string;
  @Input() public rechts: boolean = false;
  @Input() public links: boolean = false;
  @Input() public oben: boolean = false;
  @Input() public unten: boolean = false;
  public wert: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.rechts = false;
    this.links = false;
    this.oben = false;
    this.unten = false;
  }

  ngOnInit() {
  }

  public onKey(e: KeyboardEvent) {

    // let target: any = e.target;
    // console.log('Key: ' + e.keyCode + ' Char: ' + e.charCode + ' ID: ' + target.id + ' Value: ' + target.value + ' r:' + (typeof this.rechts) + ' ' + this.rechts + ' o:' + (typeof this.oben) + ' ' + this.oben);
    if (e.charCode >= 49 && e.charCode < 49 + 9) { // 1-9
      this.value = String.fromCharCode(e.charCode);
      this.focusNextId(1, 0);
      this.changed.emit(this.getX() * 100 + this.getY() * 10 + Global.toInt(this.value));
    } else if (e.charCode > 0) {
      this.value = null;
      e.preventDefault();
      this.focusNextId(1, 0);
      this.changed.emit(this.getX() * 100 + this.getY() * 10 + 0);
      // return false;
    } else if (e.keyCode === 8) {
      this.value = null; // delete
      this.focusNextId(-1, 0);
      this.changed.emit(this.getX() * 100 + this.getY() * 10 + 0);
    } else if (e.keyCode === 46) {
      this.value = null; // entfernen
      this.focusNextId(1, 0);
      this.changed.emit(this.getX() * 100 + this.getY() * 10 + 0);
    } else if (e.keyCode === 37) {
      this.focusNextId(-1, 0); // links
    } else if (e.keyCode === 38) {
      this.focusNextId(0, -1); // unten
    } else if (e.keyCode === 39) {
      this.focusNextId(1, 0); // rechts
    } else if (e.keyCode === 40) {
      this.focusNextId(0, 1); // oben
    }
  }

  private getX(): number {
    return Global.toInt(this.x);
  }

  private getY(): number {
    return Global.toInt(this.y);
  }

  private focusNextId(dx: number, dy: number) {
    let x = this.getX() + dx;
    let y = this.getY() + dy;
    while (x < 0) {
      x += Global.SU_MAXX;
      y--;
    }
    while (x >= Global.SU_MAXX) {
      x -= Global.SU_MAXX;
      y++;
    }
    while (y < 0) {
      y += Global.SU_MAXX;
    }
    while (y >= Global.SU_MAXX) {
      y -= Global.SU_MAXX;
    }
    let id = 'x' + x + 'y' + y;
    let f = document.getElementById(id);
    if (f != null) {
      f.focus();
    }
  }
}