import { createAction, union } from '@ngrx/store'

export const SetErrorGlobal = createAction('[ERROR_GLOBAL] Set', (payload: string = '') => ({payload}));

export const ClearErrorGlobal = createAction('[ERROR_GLOBAL] Clear');

export const LoginGlobal = createAction('[GLOBAL] Login', (payload: string = '') => ({payload}));

const all = union({SetErrorGlobal, ClearErrorGlobal});
export type GlobalActionsUnion = typeof all;
