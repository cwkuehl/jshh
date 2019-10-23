import * as FzNotizActions from '../actions/fznotiz.actions'
import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'
import { createReducer, on } from '@ngrx/store';
import { Global } from '../services/global';
import { environment } from '../../environments/environment';

export const reducerDiary = createReducer(
  [],
  on(TbEintragActions.Save, (state, { payload }) => [...state, payload]),
);

export const reducerMemos = createReducer(
  [],
  on(FzNotizActions.Save, (state, { payload }) => [...state, payload]),
);

const InitUserId = 'Benutzer';

export const reducerUserId = createReducer(
  environment.production ? InitUserId : 'Wolfgang',
  on(GlobalActions.LoginOk, (state, { payload }) => Global.nes(payload) ? InitUserId : payload),
);

const InitReplicationServer = 'https://localhost:4202/';

export const reducerReplicationServer = createReducer(
  environment.production ? InitReplicationServer : 'http://localhost:4201/',
  on(GlobalActions.SaveReplOk, (state, { payload }) => Global.nes(payload) ? InitReplicationServer : payload),
);

export const reducerGlobalError = createReducer(
  '',
  on(GlobalActions.SetError, (state, { payload }) => payload),
  on(GlobalActions.ClearError, (state) => '')
);
