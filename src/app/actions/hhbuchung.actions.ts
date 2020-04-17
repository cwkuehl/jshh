import { createAction, union, props } from '@ngrx/store'
import { HhBuchung, HhKonto, HhEreignis } from '../apis'

/* Lesen aller Buchungen. */
export const Load = createAction('[HH_BUCHUNG] Load');

/* Speichern einer Buchung. */
export const Save = createAction('[HH_BUCHUNG] Save', props<{ booking: HhBuchung }>());

/* Speichern eines Ereignisses. */
export const SaveEvent = createAction('[HH_EREIGNIS] Save', props<{ event: HhEreignis }>());

/* Speichern eines Kontos. */
export const SaveAccount = createAction('[HH_KONTO] Save', props<{ account: HhKonto }>());

/* Action, die nichts machts. */
export const Empty = createAction('[HH_BUCHUNG] Empty');

const all = union({ Load, Save, SaveEvent, SaveAccount, Empty });
export type HhBuchungActionsUnion = typeof all;
