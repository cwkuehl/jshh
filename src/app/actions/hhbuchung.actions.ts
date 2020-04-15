import { createAction, union, props } from '@ngrx/store'
import { HhBuchung } from '../apis'

/* Lesen aller Buchungen. */
export const Load = createAction('[HH_BUCHUNG] Load');

/* Speichern einer Buchungen. */
export const Save = createAction('[HH_BUCHUNG] Save', props<{ booking: HhBuchung }>());

/* Action, die nichts machts. */
export const Empty = createAction('[HH_BUCHUNG] Empty');

const all = union({ Load, Save, Empty });
export type HhBuchungActionsUnion = typeof all;
