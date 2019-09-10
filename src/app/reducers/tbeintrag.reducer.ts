import { Action } from '@ngrx/store'
import { TbEintrag } from './../apis'
import * as TbEintragActions from '../actions/tbeintrag.actions'

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
      case TbEintragActions.ADD_TB_EINTRAG:
          return [...state, action.payload];
      default:
          return state;
  }
}
