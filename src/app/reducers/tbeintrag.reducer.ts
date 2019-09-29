import { TbEintrag } from './../apis'
import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'
import { createReducer, on } from '@ngrx/store';

const initialState: TbEintrag = {
  datum: new Date(),
  eintrag: 'heute',
  angelegtAm: new Date(),
  angelegtVon: 'niemand'
}

export function reducer(state: TbEintrag[] = [initialState], action: TbEintragActions.Actions) {

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

export function reducerUserId(state: string = 'Benutzer', action: GlobalActions.GlobalActionsUnion) {

  switch(action.type) {
    default:
      return state;
  }
}

export function reducerReplicationServer(state: string = '192.168.2.110', action: GlobalActions.GlobalActionsUnion) {

  switch(action.type) {
    default:
      return state;
  }
}

export const reducerGlobalError = createReducer(
  '',
  on(GlobalActions.SetErrorGlobal, (state, { payload }) => payload),
  on(GlobalActions.ClearErrorGlobal, (state) => '')
);
