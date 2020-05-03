import { Revision } from './revision';

export interface FzFahrrad extends Revision {
  uid: string;
  bezeichnung: string;
  typ: string;
}
