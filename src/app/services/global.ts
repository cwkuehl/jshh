import { v4 as uuid } from 'uuid';
import { HttpErrorResponse } from '@angular/common/http';

/** Globale Funktionen */
export class Global {

  constructor() { }

  /** Macht nichts. */
  public static machNichts(): number {
    return 0;
  }

  /**
   * Liefert Datum aus Einzeldaten.
   * @param tag
   * @param monat
   * @param jahr
   */
  public static date(tag: number, monat: number, jahr: number): Date {
    //let d = new Date(jahr, monat - 1, tag);
    //return this.clearTime(d);
    var d = new Date(Date.UTC(jahr, monat - 1, tag, 0, 0, 0, 0));
    return d;
  }

  /**
   * Liefert Datum aus String im Format yyyy-MM-dd.
   * @param s Umzuwandelnder String.
   */
  public static toDate(s: string): Date {
    let d = Global.today();
    if (Global.nes(s))
      return d;
    var parts = s.split('-');
    if (parts.length > 0)
      d.setFullYear(parseInt(parts[0]));
    if (parts.length > 1)
      d.setMonth(parseInt(parts[1]) - 1);
    if (parts.length > 2)
      d.setDate(parseInt(parts[2]));
    return d;
  }

  /**
   * Liefert Datum m Format yyyy-MM-dd.
   * @param d Betroffenes Datum.
   */
  public static toString(d: Date): string {
    if (d == null) {
      return '';
    }
    let m = d.getMonth() + 1;
    let mm = (m < 10 ? '0' : '') + m.toString();
    let d0 = d.getDate();
    let dd = (d0 < 10 ? '0' : '') + d0.toString();
    let s = `${d.getFullYear()}-${mm}-${dd}`;
    //let s = d.toISOString(); // geht nicht wegen Local Date mit 00:00
    //s = s.substring(0, 10);
    return s;
  }

  public static today(): Date {
    let d = new Date();
    //d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    //d.setTime(d.getTime() - d.getTimezoneOffset()*60*1000);
    return d;
  }

  public static clearTime(d: Date): Date {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    //d.setTime(d.getTime() - d.getTimezoneOffset()*60*1000);
    return d;
  }

  public static now(): Date {
    let d = new Date();
    d.setMilliseconds(0);
    return d;
  }

  public static nes(str: string): boolean {
    return str == null ? true : str === '' ? true : false;
  }

  public static trim(str: string): string {
    return str == null ? '' : String.prototype.trim ?
      str.trim() : str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  public static trimNull(str: string): string {
    var t = Global.trim(str);
    return t.length <= 0 ? null : t;
  }

  /**
   * Wandelt einen Wert in einen Integer.
   * @param s Betroffener Wert.
   * @returns Umgewandelter Integer.
   */
  public static toInt(s: any): number {
    if (s == null) {
      return 0;
    }
    if (typeof s === 'number') {
      return s;
    }
    if (typeof s === 'string') {
      let i = parseInt(s, 10);
      if (!isNaN(i))
        return i;
    }
    return 0;
  }

  /**
   * Wandelt einen Wert in eine Zahl.
   * @param s Betroffener Wert.
   * @param de Ist es eine deutsche Zahl mit Komma?
   * @returns Umgewandelte Zahl.
   */
  public static toNumber(s: any, de: boolean = true): number {
    if (s == null) {
      return 0;
    }
    if (typeof s === 'number') {
      return s;
    }
    if (typeof s === 'string') {
      let s1 = de ? s.replace('.', '').replace(',', '.') : s.replace(',', '');
      let i = parseFloat(s1);
      if (!isNaN(i))
        return i;
    }
    return 0;
  }

  /**
   * Rundet eine Zahl.
   * @param s Betroffene Zahl.
   * @param digits Anzahl Nachkommastellen.
   * @returns Gerundete Zahl.
   */
  public static round(n: number, digits: number = 2): number {
    if (digits <= 0)
      return Math.round(n);
    var p10 = Math.pow(10, digits);
    return Math.round(n * p10) / p10;
  }

  public static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static getNumberArray(anzahl: number): number[] {
    if (anzahl < 0) {
      return null;
    }
    let a = [];
    for (let i = anzahl - 1; i >= 0; i--) {
      a[i] = 0;
    }
    return a;
  }

  /* Anzeige des Datums in lokaler Zeit. */
  public static formatDatumVon(datum: Date, von: string): string {
    if (datum == null && Global.nes(von)) {
      return null;
    }
    let s = '';
    if (datum != null) {
      //s = datum.toLocaleDateString() + ' ' + datum.toLocaleTimeString();
      let d = new Date(datum.getTime());
      d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
      s = d.toISOString();
      s = s.substring(0, 10) + ' ' + s.substring(11, 19);
    }
    if (!Global.nes(von)) {
      s += ' von ' + von;
    }
    return s;
  }

  public static getUID(): string {
    var s = uuid();
    if (s.length > 35)
      s = s.substring(0, 8) + s.substring(9); // Erstes - entfernen.
    return s;
  }

  public static handleError(err: HttpErrorResponse): string {
    //var errortype: string = err.error.constructor.toString().match(/\w+/g)[1];
    //var errorstring: string = (err.error instanceof ProgressEvent) ? 'PE' : err.error.toString();
    var msg: string = err.error.error ? err.error.error.message
      : (err.message + ((err.error instanceof ProgressEvent) ? '' : ` (${err.error})`));
    var msg2 = `Server error: ${err.statusText} (${err.status})  Details: ${msg}`;
    return msg2;
  }
}