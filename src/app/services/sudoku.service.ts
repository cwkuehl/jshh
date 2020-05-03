import { Injectable } from '@angular/core';
import { Kontext, Sudoku } from '../apis';
import { BaseService } from '../services/base.service';
import { Global } from '../services/global';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { JshhDatabase } from './database';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SudokuService extends BaseService {

  private context: SudokuContext;

  constructor(store: Store<AppState>, db: JshhDatabase, http: HttpClient) {
    super(store, db, http);
    // console.log('SudokuService ' + this.dbservice.getId().getMilliseconds());
    this.context = new SudokuContext(null, true);
  }

  getZahlen(): number[] {
    return this.context.getZahlen();
  }

  getDiagonal(): boolean {
    return this.context.getDiagonal();
  }

  setSudoku(zahlen: number[], diagonal: boolean) {

    this.context.setZahlen(zahlen);
    this.context.setDiagonal(diagonal);
  }

  getAnzahl(zahlen: number[]): number {
    return SudokuContext.getAnzahl(zahlen);
  }

  getStand(schluessel: string): Promise<Sudoku> {

    if (schluessel == null) {
      return Promise.resolve(null);
    }
    return Promise.resolve(this.getSudoku(schluessel));
  }

  public speichereStand(schluessel: string, stand: string): Promise<any> {

    // console.log('Stand: ' + stand);
    let daten = this.getKontext();
    if (schluessel == null) {
      return Promise.resolve(null);
    }
    stand = Global.trim(stand);
    let leer = Global.nes(stand);
    return this.getSudoku(schluessel).then((sudoku: Sudoku) => {
      if (sudoku == null) {
        if (!leer) {
          sudoku = { schluessel: schluessel, wert: stand, angelegtAm: null, angelegtVon: null, geaendertAm: null, geaendertVon: null };
          this.iuSudoku(daten, sudoku);
        }
      } else if (!leer) {
        if (stand !== sudoku.wert) {
          sudoku.wert = stand;
          this.iuSudoku(daten, sudoku);
        }
      } else {
        // leeren Eintrag löschen
        this.deleteSudoku(daten, schluessel);
      }
    });
  }

  public test() {
    SudokuContext.sudokuTest(this.context, true);
  }

  /**
  * Sudoku lösen versuchen.
  * @param nur1Zug Soll nur 1 Zug berechnet werden?
  */
  public sudokuLoesen(nur1Zug: boolean) {

    let c = new SudokuContext(this.context.getZahlen(), this.context.getDiagonal());
    SudokuContext.sudokuLoesen(c, nur1Zug);
    SudokuContext.copy(this.context.getZahlen(), c.getZahlen());
  }

  getSudoku(schluessel: string): Promise<Sudoku> {

    if (Global.nes(schluessel)) {
      return this.db.Sudoku.filter(a => true).first();
    }
    return this.db.Sudoku.get(schluessel);
  }

  iuSudoku(daten: Kontext, e: Sudoku): Promise<string> {

    if (daten == null || e == null) {
      return Promise.reject('Parameter fehlt');
    }
    this.iuRevision(daten, e);
    return this.db.Sudoku.put(e);
  }

  deleteSudoku(daten: Kontext, e: string): Promise<void> {

    if (daten == null || e == null) {
      return Promise.reject('Parameter fehlt');
    }
    return this.db.Sudoku.delete(e);
  }
}

/** Sudoku-Kontext. */
class SudokuContext {

  private maxx: number = Global.SU_MAXX;
  private maxxw: number = Global.SU_MAXXW;
  private maxyw: number = Global.SU_MAXYW;
  private max: number = Global.SU_MAXX * Global.SU_MAXX;

  private zahlen: number[] = [];
  private diagonal: boolean = true;

  // private zeilen: number[] = [];
  // private spalten: number[] = [];
  // private kaesten: number[] = [];
  // private diagonalen: number[] = [];

  constructor(zahlen: number[], diagonal: boolean) {
    for (let i = 0; i < this.max; i++) {
      this.zahlen.push(0);
    }
    SudokuContext.copy(this.zahlen, zahlen);
    this.diagonal = diagonal;
  }

  public getZahlen(): number[] {
    return this.zahlen;
  }

  public setZahlen(zahlen: number[]) {
    if (zahlen != null) {
      this.zahlen = zahlen;
    }
  }

  public getDiagonal(): boolean {
    return this.diagonal;
  }

  public setDiagonal(diagonal: boolean) {
    this.diagonal = diagonal;
  }

  /* Kopieren der Arrays. */
  static copy(ziel: number[], quelle: number[]) {

    if (ziel == null || quelle == null) {
      return;
    }
    let l = Math.min(ziel.length, quelle.length);
    for (let i = 0; i < l; i++) {
      ziel[i] = quelle[i];
    }
  }

  /* Liefert einen Klon der Zahlen. */
  static getClone(zahlen: number[]): number[] {
    return zahlen.slice(0);
  }

  /* Liefert die Anzahl der gefüllten Felder. */
  static getAnzahl(zahlen: number[]): number {

    if (zahlen == null) {
      return 0;
    }
    let anzahl = 0;
    for (let i = 0; i < zahlen.length; i++) {
      if (zahlen[i] > 0) {
        anzahl++;
      }
    }
    return anzahl;
  }

  /**
   * Sudoku-Spiel auf Widerspruch untersuchen.
   * @param c Kontext mit Daten zur Berechnung.
   * @param exception True, wenn Exception bei Widerspruch erfolgen soll.
   * @return Nummer des evtl. ersten widerspürchlichen Feldes.
   * @throws Exception falls Zahlen widersprüchlich sind.
   */
  public static sudokuTest(c: SudokuContext, exception: boolean): number {

    let feld = -1;

    try {
      // Zeilen, Spalten und Kästen bestimmen
      let zeilen = Global.getNumberArray(c.maxx * c.maxx);
      let spalten = Global.getNumberArray(c.maxx * c.maxx);
      let kaesten = Global.getNumberArray(c.maxx * c.maxx);
      let diagonalen = Global.getNumberArray(c.maxx * 2);
      for (let row = 0; row < c.maxx; row++) {
        for (let col = 0; col < c.maxx; col++) {
          let wert = c.zahlen[row * c.maxx + col];
          if (wert > 0) {
            let knr = Math.floor(row / c.maxyw) * c.maxyw + Math.floor(col / c.maxxw);
            if (zeilen[row * c.maxx + wert - 1] === 0) {
              zeilen[row * c.maxx + wert - 1] = wert;
            } else {
              if (exception) {
                throw new Error('Widerspruch in Zeile ' + (row + 1) + ' mit Zahl ' + wert + '.');
              }
              return row * c.maxx + col;
            }
            if (spalten[col * c.maxx + wert - 1] === 0) {
              spalten[col * c.maxx + wert - 1] = wert;
            } else {
              if (exception) {
                throw new Error('Widerspruch in Spalte ' + (col + 1) + ' mit Zahl ' + wert + '.');
              }
              return row * c.maxx + col;
            }
            if (kaesten[knr * c.maxx + wert - 1] === 0) {
              kaesten[knr * c.maxx + wert - 1] = wert;
            } else {
              if (exception) {
                throw new Error('Widerspruch in Kasten ' + (knr + 1) + ' mit Zahl ' + wert + '.');
              }
              return row * c.maxx + col;
            }
            if (c.diagonal) {
              if (row === col) {
                if (diagonalen[wert - 1] === 0) {
                  diagonalen[wert - 1] = wert;
                } else {
                  if (exception) {
                    throw new Error('Widerspruch in Diagonale 1 Zeile ' + (row + 1) + ' mit Zahl ' + wert + '.');
                  }
                  return row * c.maxx + col;
                }
              }
              if (row === c.maxx - 1 - col) {
                if (diagonalen[c.maxx + wert - 1] === 0) {
                  diagonalen[c.maxx + wert - 1] = wert;
                } else {
                  if (exception) {
                    throw new Error('Widerspruch in Diagonale 2 Zeile ' + (row + 1) + ' mit Zahl ' + wert + '.');
                  }
                  return row * c.maxx + col;
                }
              }
            }
          }
        }
      }
    } finally {
      if (feld === -1 && SudokuContext.getAnzahl(c.zahlen) >= c.maxx * c.maxx) {
        feld = -2; // vollständig gelöst
      }
    }
    return feld;
  }

  /**
   * Eine neue Zahl suchen.
   * @param c Kontext mit Daten zur Berechnung.
   * @param maxAnzahl Feld gesucht, dass höchstens diese Anzahl von Zahlen zulässt.
   * @return Nummer des evtl. geänderten Feldes.
   * @throws Exception falls Zahlen widersprüchlich sind.
   */
  private static sudokuEinzeln(c: SudokuContext, maxAnzahl: number, feldv: number[], varianten: number[]): number {

    let feld = -1;

    try {
      // Zeilen, Spalten und Kästen bestimmen
      let zeilen = Global.getNumberArray(c.maxx * c.maxx);
      let spalten = Global.getNumberArray(c.maxx * c.maxx);
      let kaesten = Global.getNumberArray(c.maxx * c.maxx);
      let diagonalen = Global.getNumberArray(c.maxx * 2);
      for (let row = 0; row < c.maxx; row++) {
        for (let col = 0; col < c.maxx; col++) {
          let wert = c.zahlen[row * c.maxx + col];
          if (wert > 0) {
            let knr = Math.floor(row / c.maxyw) * c.maxyw + Math.floor(col / c.maxxw);
            zeilen[row * c.maxx + wert - 1] = wert;
            spalten[col * c.maxx + wert - 1] = wert;
            kaesten[knr * c.maxx + wert - 1] = wert;
            if (row === col) {
              // 1. Diagonale
              diagonalen[wert - 1] = wert;
            }
            if (row === c.maxx - 1 - col) {
              // 2. Diagonale
              diagonalen[c.maxx + wert - 1] = wert;
            }
          }
        }
      }
      // neue Zahl bestimmen, wenn nur noch eine fehlt
      for (let row = 0; row < c.maxx; row++) {
        for (let col = 0; col < c.maxx; col++) {
          let wert = c.zahlen[row * c.maxx + col];
          // leeres Feld untersuchen
          if (wert === 0) {
            let knr = Math.floor(row / c.maxyw) * c.maxyw + Math.floor(col / c.maxxw);
            let versuchz = 0;
            let versuchs = 0;
            let versuchk = 0;
            let versuch1 = 0;
            let versuch2 = 0;
            let anzahlz = 0;
            let anzahls = 0;
            let anzahlk = 0;
            let anzahl1 = 0;
            let anzahl2 = 0;
            let varianten1 = Global.getNumberArray(c.maxx);
            let varianten2 = Global.getNumberArray(c.maxx);
            let variantenZ = Global.getNumberArray(c.maxx);
            let variantenS = Global.getNumberArray(c.maxx);
            let variantenK = Global.getNumberArray(c.maxx);
            for (let i = 0; i < c.maxx; i++) {
              varianten[i] = 0;
            }
            for (let i = 0; i < c.maxx; i++) {
              if (zeilen[row * c.maxx + i] === 0) {
                versuchz = i + 1;
                anzahlz++;
                variantenZ[i] = 1;
              }
              if (spalten[col * c.maxx + i] === 0) {
                versuchs = i + 1;
                anzahls++;
                variantenS[i] = 1;
              }
              if (kaesten[knr * c.maxx + i] === 0) {
                versuchk = i + 1;
                anzahlk++;
                variantenK[i] = 1;
              }
              if (c.diagonal) {
                if (row === col) {
                  // 1. Diagonale
                  if (diagonalen[i] === 0) {
                    versuch1 = i + 1;
                    anzahl1++;
                    varianten1[i] = 1;
                  }
                }
                if (row === c.maxx - 1 - col) {
                  // 2. Diagonale
                  if (diagonalen[c.maxx + i] === 0) {
                    versuch2 = i + 1;
                    anzahl2++;
                    varianten2[i] = 1;
                  }
                }
              }
            }
            // Genau eine Zahl passt in der Zeile.
            if (anzahlz === 1) {
              if (anzahls < 1 || anzahlk < 1) {
                throw new Error('Widerspruch Zeile in (' + (row + 1) + ',' + (col + 1) + ')');
              }
              c.zahlen[row * c.maxx + col] = versuchz;
              feld = row * c.maxx + col;
              return feld;
            }
            // Genau eine Zahl passt in der Spalte.
            if (anzahls === 1) {
              if (anzahlz < 1 || anzahlk < 1) {
                throw new Error('Widerspruch Spalte in (' + (row + 1) + ',' + (col + 1)
                  + ')');
              }
              c.zahlen[row * c.maxx + col] = versuchs;
              feld = row * c.maxx + col;
              return feld;
            }
            // Genau eine Zahl passt im Kasten.
            if (anzahlk === 1) {
              if (anzahlz < 1 || anzahls < 1) {
                throw new Error('Widerspruch Kasten in (' + (row + 1) + ',' + (col + 1)
                  + ')');
              }
              c.zahlen[row * c.maxx + col] = versuchk;
              feld = row * c.maxx + col;
              return feld;
            }
            // Genau eine Zahl passt in Diagonale 1.
            if (anzahl1 === 1) {
              c.zahlen[row * c.maxx + col] = versuch1;
              feld = row * c.maxx + col;
              return feld;
            }
            // Genau eine Zahl passt in Diagonale 2.
            if (anzahl2 === 1) {
              c.zahlen[row * c.maxx + col] = versuch2;
              feld = row * c.maxx + col;
              return feld;
            }
            let anzahlv = 0; // Anzahl Varianten.
            for (let i = 0; i < c.maxx; i++) {
              if (variantenZ[i] > 0 && variantenS[i] > 0 && variantenK[i] > 0) {
                varianten[anzahlv] = i + 1;
                anzahlv++;
              }
            }
            if (anzahlv === 1) {
              c.zahlen[row * c.maxx + col] = varianten[0];
              feld = row * c.maxx + col;
              return feld;
            } else if (anzahlv <= maxAnzahl) {
              feldv[0] = row * c.maxx + col;
              if (varianten[0] === 0) {
                return -1;
              }
              return -3; // Lösen mit Varianten
            }
          }
        }
      }
      // neue Zahl für einen Kasten bestimmen
      // mit Ausschluss über Zeilen und Spalten
      let anzahl = Global.getNumberArray(c.maxx);
      let pos = Global.getNumberArray(c.maxx);
      for (let krow = 0; krow < c.maxyw; krow++) {
        for (let kcol = 0; kcol < c.maxxw; kcol++) {
          // Untersuchung eines Kastens
          for (let i = 0; i < c.maxx; i++) {
            anzahl[i] = 0;
            pos[i] = -1;
            if (kaesten[(krow * c.maxxw + kcol) * c.maxx + i] > 0) {
              // Zahl ist erledigt.
              anzahl[i] = -1;
            }
          }
          let knr = krow * c.maxxw + kcol;
          for (let irow = 0; irow < c.maxyw; irow++) {
            for (let icol = 0; icol < c.maxxw; icol++) {
              let row = krow * c.maxxw + irow;
              let col = kcol * c.maxyw + icol;
              let wert = c.zahlen[row * c.maxx + col];
              if (wert === 0) {
                for (let i = 0; i < c.maxx; i++) {
                  if (anzahl[i] >= 0 && zeilen[row * c.maxx + i] === 0 && spalten[col * c.maxx + i] === 0
                    && kaesten[knr * c.maxx + i] === 0) {
                    anzahl[i]++;
                    pos[i] = row * c.maxx + col;
                  }
                }
              }
            }
          }
          for (let i = 0; i < c.maxx; i++) {
            if (anzahl[i] === 1) {
              feld = pos[i];
              c.zahlen[feld] = i + 1;
              return feld;
            }
          }
        }
      }
    } finally {
      if (feld === -1 && SudokuContext.getAnzahl(c.zahlen) >= c.maxx * c.maxx) {
        feld = -2; // vollständig gelöst
      }
    }
    return feld;
  }

  /**
   * Sudoku lösen versuchen.
   * @param c Kontext mit Daten zur Berechnung.
   * @param nur1Zug Soll nur 1 Zug berechnet werden?
   * @throws Exception falls Sudoku nicht vollständig oder nicht eindeutig lösbar.
   */
  public static sudokuLoesen(c: SudokuContext, nur1Zug: boolean) {

    let anzahl = 1;
    let ergebnis = 0;
    let ende = false;
    let clone: number[] = null;
    let clone1: number[] = null;
    let loesung: number[] = null;
    let list: number[][] = [];
    let feld = Global.getNumberArray(1);
    let varianten = Global.getNumberArray(c.maxx);

    SudokuContext.sudokuTest(c, true);
    if (SudokuContext.getAnzahl(c.zahlen) >= c.maxx * c.maxx) {
      throw new Error('Sudoku ist schon vollständig gelöst.');
    }
    if (nur1Zug) {
      clone1 = SudokuContext.getClone(c.zahlen);
    }
    do {
      anzahl = 0;
      do {
        anzahl++;
        ergebnis = SudokuContext.sudokuEinzeln(c, anzahl, feld, varianten);
        // System.out.println("Anzahl: " + miAnzahl + " Variante: " +
        // varianten + " Ergebnis: " + ergebnis);
        if (ergebnis === -3) {
          c.zahlen[feld[0]] = varianten[0];
          // Andere Varianten merken.
          for (let i = 1; i < anzahl; i++) {
            clone = SudokuContext.getClone(c.zahlen);
            clone[feld[0]] = varianten[i];
            list.push(clone);
          }
          ergebnis = 0;
        } else if (ergebnis >= 0) {
          if (SudokuContext.sudokuTest(c, false) >= 0) {
            // Andere Variante versuchen wegen Widerspruch.
            if (list.length <= 0) {
              if (loesung == null) {
                throw new Error('Sudoku nicht lösbar (fehlende Variante).');
              }
              ende = true;
            } else {
              SudokuContext.copy(c.zahlen, list.pop());
            }
          } else if (nur1Zug && list.length <= 0) {
            ende = true;
          }
        }
      } while (!ende && anzahl < c.maxx && (ergebnis === -1));
      if (SudokuContext.getAnzahl(c.zahlen) >= c.maxx * c.maxx) {
        if (loesung == null) {
          loesung = SudokuContext.getClone(c.zahlen);
          // Andere Variante versuchen.
          if (list.length > 0) {
            SudokuContext.copy(c.zahlen, list.pop());
          }
        } else {
          SudokuContext.copy(c.zahlen, loesung);
          if (list.length > 0) {
            throw new Error('Sudoku lösbar, aber nicht eindeutig.');
          }
        }
      }
    } while (!ende && ergebnis >= 0);
    if (loesung != null) {
      SudokuContext.copy(c.zahlen, loesung);
    }
    if (nur1Zug) {
      let i = 0;
      let clone2 = SudokuContext.getClone(c.zahlen);
      for (; i < clone1.length; i++) {
        if (clone1[i] !== clone2[i]) {
          clone1[i] = clone2[i];
          break;
        }
      }
      if (i >= clone1.length) {
        throw new Error('Keine Zahl mehr gefunden.');
      }
      SudokuContext.copy(c.zahlen, clone1);
    } else if (SudokuContext.getAnzahl(c.zahlen) < c.maxx * c.maxx) {
      throw new Error('Sudoku nicht vollständig lösbar.');
    }
  }
}