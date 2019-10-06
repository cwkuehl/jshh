import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'
import { createReducer, on } from '@ngrx/store';
import { Global } from '../services/global';
import { environment } from '../../environments/environment';

export const reducer = createReducer(
  [],
  on(TbEintragActions.SaveTbEintrag, (state, { payload }) => [...state, payload]),
);

const InitUserId = 'Benutzer';

export const reducerUserId = createReducer(
  environment.production ? InitUserId : 'Wolfgang',
  on(GlobalActions.LoginOkGlobal, (state, { payload }) => Global.nes(payload) ? InitUserId : payload),
);

const InitReplicationServer = 'https://localhost:4202/';

export const reducerReplicationServer = createReducer(
  environment.production ? InitReplicationServer : 'http://localhost:4201/',
  on(GlobalActions.SaveReplOkGlobal, (state, { payload }) => Global.nes(payload) ? InitReplicationServer : payload),
);

export const reducerGlobalError = createReducer(
  '',
  on(GlobalActions.SetErrorGlobal, (state, { payload }) => payload),
  on(GlobalActions.ClearErrorGlobal, (state) => '')
);
