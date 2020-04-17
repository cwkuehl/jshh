import { Revision } from './revision';

export interface HhKonto extends Revision {
  uid: string;
  sortierung: string;
  art: string;
  kz: string;
  name: string;
  gueltigVon?: Date;
  gueltigBis?: Date;
  periodeVon: number;
  periodeBis: number;
  betrag: number;
  ebetrag: number;
  replid?: string;
}
