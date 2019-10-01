import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'
import { createReducer, on } from '@ngrx/store';
import { Global } from '../services/global';


export const reducer = createReducer(
  [],
  on(TbEintragActions.SaveTbEintrag, (state, { payload }) => [...state, payload]),
);

export const reducerUserId = createReducer(
  'Benutzer',
  on(GlobalActions.LoginOkGlobal, (state, { payload }) => Global.nes(payload) ? 'Benutzer' : payload),
);

export const reducerReplicationServer = createReducer(
  //'192.168.2.110',
  'localhost:4199',
);

export const reducerGlobalError = createReducer(
  '',
  on(GlobalActions.SetErrorGlobal, (state, { payload }) => payload),
  on(GlobalActions.ClearErrorGlobal, (state) => '')
);
