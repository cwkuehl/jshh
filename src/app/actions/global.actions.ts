import { createAction, union } from '@ngrx/store'

export const SetErrorGlobal = createAction('[ERROR_GLOBAL] Set', (payload: string = '') => ({payload}));
export const ClearErrorGlobal = createAction('[ERROR_GLOBAL] Clear');

export const LoginGlobal = createAction('[GLOBAL] Login', (payload: string = '') => ({payload}));
export const LoginOkGlobal = createAction('[GLOBAL] LoginOk', (payload: string = '') => ({payload}));

export const SaveReplGlobal = createAction('[GLOBAL] SaveRepl', (payload: string = '') => ({payload}));
export const SaveReplOkGlobal = createAction('[GLOBAL] SaveRepl2', (payload: string = '') => ({payload}));

const all = union({SetErrorGlobal, ClearErrorGlobal, LoginGlobal, LoginOkGlobal, SaveReplGlobal, SaveReplOkGlobal});
export type GlobalActionsUnion = typeof all;
