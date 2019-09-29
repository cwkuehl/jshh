import { Action } from '@ngrx/store'
import { TbEintrag } from './../apis'
import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'

// Section 1
const initialState: TbEintrag = {
  datum: new Date(),
  eintrag: 'heute',
  angelegtAm: new Date(),
  angelegtVon: 'niemand'
}

// Section 2
export function reducer(state: TbEintrag[] = [initialState], action: TbEintragActions.Actions) {

  // Section 3
  switch(action.type) {
    case TbEintragActions.SAVE_TB_EINTRAG:
      return [...state, action.payload];
    case TbEintragActions.LOAD_TB_EINTRAG:
      //state.splice(action.payload, 1)
      return state;
    default:
      return state;
  }
}

export function reducerUserId(state: string = 'Benutzer', action: TbEintragActions.Actions) {

  switch(action.type) {
    default:
      return state;
  }
}

export function reducerGlobalError(state: string = '', action: GlobalActions.Actions) {

  switch(action.type) {
    case GlobalActions.SET_ERROR_GLOBAL:
      return action.payload;
    case GlobalActions.CLEAR_ERROR_GLOBAL:
      return '';
    default:
      return state;
  }
}
