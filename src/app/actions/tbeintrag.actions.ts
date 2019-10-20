import { createAction, union } from '@ngrx/store'
import { TbEintrag } from './../apis'

/* Speichern eines Tagebucheintrags */
export const LoadTbEintrag = createAction('[TB_EINTRAG] Load');

/* Speichern eines Tagebucheintrags */
export const SaveTbEintrag = createAction('[TB_EINTRAG] Save', (payload: TbEintrag) => ({payload}));

/* Action, die nichts machts. */
export const EmptyTbEintrag = createAction('[TB_EINTRAG] Empty');

/* Fehler bei der Tagebuch-Verarbeitung. */
export const ErrorTbEintrag = createAction('[TB_EINTRAG] Error', (payload: string = '') => ({payload}));

const all = union({LoadTbEintrag, SaveTbEintrag, EmptyTbEintrag, ErrorTbEintrag});
export type TbEintragActionsUnion = typeof all;
