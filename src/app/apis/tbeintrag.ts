import { Revision } from './revision';

export interface TbEintrag extends Revision {
  datum: Date;
  eintrag: string;
}
