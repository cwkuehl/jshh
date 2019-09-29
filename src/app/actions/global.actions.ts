import { Action, createAction } from '@ngrx/store'

export const SET_ERROR_GLOBAL = '[ERROR_GLOBAL] Set'
export const CLEAR_ERROR_GLOBAL = '[ERROR_GLOBAL] Clear'

export class SetErrorGlobal implements Action {
  readonly type = SET_ERROR_GLOBAL
  constructor(public payload: string) {}
}

//export const ClearErrorGlobal = createAction(CLEAR_ERROR_GLOBAL);
export class ClearErrorGlobal implements Action {
  readonly type = CLEAR_ERROR_GLOBAL
  constructor() {}
}


export type Actions = SetErrorGlobal | ClearErrorGlobal
