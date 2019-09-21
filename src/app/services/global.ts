/** Globale Funktionen */
export class Global {

  constructor() { }

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
      d.setMonth(parseInt(parts[1])-1);
    if (parts.length > 2)
      d.setDate(parseInt(parts[2]));
    return d;
  }

  public static today(): Date {
    let d = new Date();
    //d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    d.setTime(d.getTime() - d.getTimezoneOffset()*60*1000);
    return d;
  }

  public static clearTime(d: Date): Date {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    d.setTime(d.getTime() - d.getTimezoneOffset()*60*1000);
    return d;
  }

  public static now(): Date {
    let d = new Date();
    return d;
  }

  public static nes(str: string): boolean {
    return str == null ? true : str === '' ? true : false;
  }

  public static trim(str: string): string {
    return str == null ? '' : String.prototype.trim ?
      str.trim() : str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  public static toInt(s: any): number {

    if (s === null) {
      return 0;
    }
    if (typeof s === 'number') {
      return s;
    }
    if (typeof s === 'string') {
      let i = parseInt(s, 10);
      if (!isNaN(i)) {
        return i;
      }
    }
    return 0;
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

  public static formatDatumVon(datum: Date, von: string): string {

    if (datum == null && Global.nes(von)) {
      return null;
    }
    let s = '';
    if (datum !== null) {
      s = datum.toLocaleDateString() + ' ' + datum.toLocaleTimeString();
    }
    if (!Global.nes(von)) {
      s += ' von ' + von;
    }
    return s;
  }

}