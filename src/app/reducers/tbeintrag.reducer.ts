import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'
import { createReducer, on } from '@ngrx/store';
import { Global } from '../services/global';


export const reducer = createReducer(
  [],
  on(TbEintragActions.SaveTbEintrag, (state, { payload }) => [...state, payload]),
);

const InitUserId = 'Benutzer';

export const reducerUserId = createReducer(
  InitUserId,
  on(GlobalActions.LoginOkGlobal, (state, { payload }) => Global.nes(payload) ? InitUserId : payload),
);

const InitReplicationServer = 'https://localhost:4202/';

export const reducerReplicationServer = createReducer(
  InitReplicationServer,
  on(GlobalActions.SaveReplOkGlobal, (state, { payload }) => Global.nes(payload) ? InitReplicationServer : payload),
);

export const reducerGlobalError = createReducer(
  '',
  on(GlobalActions.SetErrorGlobal, (state, { payload }) => payload),
  on(GlobalActions.ClearErrorGlobal, (state) => '')
);
