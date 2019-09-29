import { Action, createAction, props, union } from '@ngrx/store'

//export const SET_ERROR_GLOBAL = '[ERROR_GLOBAL] Set'
//export const CLEAR_ERROR_GLOBAL = '[ERROR_GLOBAL] Clear'

export const SetErrorGlobal = createAction('[ERROR_GLOBAL] Set', (payload: string = '') => ({payload}));
// export class SetErrorGlobal implements Action {
//   readonly type = SET_ERROR_GLOBAL
//   constructor(public payload: string) {}
// }

export const ClearErrorGlobal = createAction('[ERROR_GLOBAL] Clear');
// export class ClearErrorGlobal implements Action {
//   readonly type = CLEAR_ERROR_GLOBAL
//   constructor() {}
// }


// export type Actions = SetErrorGlobal | ClearErrorGlobal
const all = union({SetErrorGlobal, ClearErrorGlobal});
export type GlobalActionsUnion = typeof all;
