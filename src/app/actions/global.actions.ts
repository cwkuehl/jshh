import { createAction, union } from '@ngrx/store'

export const SetError = createAction('[ERROR_GLOBAL] Set', (payload: string = '') => ({payload}));
export const ClearError = createAction('[ERROR_GLOBAL] Clear');

export const Login = createAction('[GLOBAL] Login', (payload: string = '') => ({payload}));
export const LoginOk = createAction('[GLOBAL] LoginOk', (payload: string = '') => ({payload}));

export const SaveRepl = createAction('[GLOBAL] SaveRepl', (payload: string = '') => ({payload}));
export const SaveReplOk = createAction('[GLOBAL] SaveRepl2', (payload: string = '') => ({payload}));

const all = union({SetError, ClearError, Login, LoginOk, SaveRepl, SaveReplOk});
export type GlobalActionsUnion = typeof all;
