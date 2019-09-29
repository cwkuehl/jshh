import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'
import { createReducer, on } from '@ngrx/store';


export const reducer = createReducer(
  [],
  on(TbEintragActions.SaveTbEintrag, (state, { payload }) => [...state, payload]),
);

export const reducerUserId = createReducer(
  'Benutzer',
);

export const reducerReplicationServer = createReducer(
  '192.168.2.110',
);

export const reducerGlobalError = createReducer(
  '',
  on(GlobalActions.SetErrorGlobal, (state, { payload }) => payload),
  on(GlobalActions.ClearErrorGlobal, (state) => '')
);
