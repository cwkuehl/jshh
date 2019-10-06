import { Revision } from './revision';

export interface TbEintrag extends Revision {
  datum: string;
  eintrag?: string;
  replid?: string;
}
