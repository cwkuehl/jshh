import { Action, createAction, props, union } from '@ngrx/store'

export const SetErrorGlobal = createAction('[ERROR_GLOBAL] Set', (payload: string = '') => ({payload}));

export const ClearErrorGlobal = createAction('[ERROR_GLOBAL] Clear');

const all = union({SetErrorGlobal, ClearErrorGlobal});
export type GlobalActionsUnion = typeof all;
