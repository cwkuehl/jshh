import { createAction, union } from '@ngrx/store'
import { TbEintrag } from './../apis'

/* Laden des aktuellen Tagebucheintrags */
export const Load = createAction('[TB_EINTRAG] Load');

/* Speichern eines Tagebucheintrags */
export const Save = createAction('[TB_EINTRAG] Save', (payload: TbEintrag) => ({payload}));

/* Action, die nichts machts. */
export const Empty = createAction('[TB_EINTRAG] Empty');

/* Fehler bei der Tagebuch-Verarbeitung. */
export const Error = createAction('[TB_EINTRAG] Error', (payload: string = '') => ({payload}));

const all = union({Load, Save, Empty, Error});
export type TbEintragActionsUnion = typeof all;
