import { Revision } from './revision';

export interface HhBuchung extends Revision {
  uid: string;
  sollValuta: Date;
  habenValuta: Date;
  kz?: string;
  betrag: number;
  ebetrag: number;
  sollKontoUid: string;
  habenKontoUid: string;
  btext: string;
  belegNr?: string;
  belegDatum: Date;
  replid?: string;
  sollKontoName?: string;
  habenKontoName?: string;
}
