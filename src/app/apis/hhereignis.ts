import { Revision } from './revision';

export interface HhEreignis extends Revision {
  uid: string;
  kz?: string;
  sollKontoUid: string;
  habenKontoUid: string;
  bezeichnung: string;
  etext: string;
  replid?: string;
}
