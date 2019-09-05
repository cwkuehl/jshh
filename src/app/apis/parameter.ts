import { Revision } from './revision';

export interface Parameter extends Revision {
  schluessel: string;
  wert?: string;
}
