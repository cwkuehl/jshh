import { createAction, union } from '@ngrx/store'
import { FzNotiz } from './../apis'

/* Lesen aller Notizen. */
export const Load = createAction('[FZ_NOTIZ] Load');

/* Speichern einer Notiz. */
export const Save = createAction('[FZ_NOTIZ] Save', (payload: FzNotiz) => ({payload}));

/* Action, die nichts machts. */
export const Empty = createAction('[FZ_NOTIZ] Empty');

const all = union({Load, Save, Empty});
export type FzNotizActionsUnion = typeof all;
