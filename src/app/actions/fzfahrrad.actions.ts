import { createAction, union, props } from '@ngrx/store'
import { FzFahrrad, FzFahrradstand } from '../apis'

/* Lesen aller Fahrradstände. */
export const Load = createAction('[FZ_FAHRRADSTAND] Load');

/* Speichern eines Fahrradstands. */
export const Save = createAction('[FZ_FAHRRADSTAND] Save', props<{ mileage: FzFahrradstand }>());

/* Speichern eines Fahrrads. */
export const SaveBike = createAction('[FZ_FAHRRAD] Save', props<{ bike: FzFahrrad }>());

/* Action, die nichts machts. */
export const Empty = createAction('[FZ_FAHRRAD] Empty');

const all = union({ Load, Save, SaveBike, Empty });
export type FzFahrradActionsUnion = typeof all;
