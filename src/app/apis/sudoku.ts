import { Revision } from './revision';

export interface Sudoku extends Revision {
  schluessel: string;
  wert: string;
}
