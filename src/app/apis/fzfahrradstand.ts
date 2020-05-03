import { Revision } from './revision';

export interface FzFahrradstand extends Revision {
  fahrradUid: string;
  datum: string;
  nr: number;
  zaehlerKm: number;
  periodeKm: number;
  periodeSchnitt: number;
  beschreibung: string;
}
