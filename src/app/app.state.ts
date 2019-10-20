import { FzNotiz, TbEintrag } from './apis';

export interface AppState {
  readonly globalError: string;
  readonly userId: string;
  readonly replicationServer: string;
  readonly memos: FzNotiz[];
  readonly diary: TbEintrag[];
}
