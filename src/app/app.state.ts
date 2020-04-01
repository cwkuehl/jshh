import { FzNotiz, Options, TbEintrag } from './apis';

export interface AppState {
  readonly globalError: string;
  readonly userId: string;
  readonly replicationServer: string;
  readonly options: Options;
  readonly memos: FzNotiz[];
  readonly diary: TbEintrag[];
}
