import { createAction, union, props } from '@ngrx/store'
import { Options } from '../apis';

export const SetError = createAction('[ERROR_GLOBAL] Set', (payload: string = '') => ({ payload }));
export const ClearError = createAction('[ERROR_GLOBAL] Clear');

export const Login = createAction('[GLOBAL] Login', (payload: string = '') => ({ payload }));
export const LoginOk = createAction('[GLOBAL] LoginOk', (payload: string = '') => ({ payload }));

export const SaveOptions = createAction('[GLOBAL] SaveOptions', props<{ options: Options }>());
export const SaveOptionsOk = createAction('[GLOBAL] SaveOptions2', props<{ options: Options }>());

const all = union({ SetError, ClearError, Login, LoginOk, SaveOptions, SaveOptionsOk });
export type GlobalActionsUnion = typeof all;
