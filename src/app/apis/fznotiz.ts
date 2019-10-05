import { Revision } from './revision';

export interface FzNotiz extends Revision {
  uid: string;
  thema: string;
  notiz?: string;
}
