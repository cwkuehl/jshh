import { createAction, union } from '@ngrx/store'
import { FzNotiz } from './../apis'

/* Speichern eines Tagebucheintrags */
export const LoadFzNotiz = createAction('[FZ_NOTIZ] Load');

/* Speichern eines Tagebucheintrags */
export const SaveFzNotiz = createAction('[FZ_NOTIZ] Save', (payload: FzNotiz) => ({payload}));

/* Action, die nichts machts. */
export const EmptyFzNotiz = createAction('[FZ_NOTIZ] Empty');

const all = union({LoadFzNotiz, SaveFzNotiz, EmptyFzNotiz});
export type FzNotizActionsUnion = typeof all;
