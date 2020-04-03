import * as FzNotizActions from '../actions/fznotiz.actions'
import * as TbEintragActions from '../actions/tbeintrag.actions'
import * as GlobalActions from '../actions/global.actions'
import { createReducer, on } from '@ngrx/store';
import { Global } from '../services/global';
import { environment } from '../../environments/environment';
import { Options } from '../apis';

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

const InitOptions: Options = {
  replicationServer: environment.production ? InitReplicationServer : 'http://localhost:4201/',
  replicationMonths: '1'
};

export const reducerOptions = createReducer(
  InitOptions,
  on(GlobalActions.SaveOptionsOk,
    (state, { options }) => ({
      replicationServer: options.replicationServer == null ? state.replicationServer : options.replicationServer,
      replicationMonths: options.replicationMonths == null ? state.replicationMonths : options.replicationMonths
    }))
);

export const reducerGlobalError = createReducer(
  '',
  on(GlobalActions.SetError, (state, { payload }) => payload),
  on(GlobalActions.ClearError, (state) => '')
);
