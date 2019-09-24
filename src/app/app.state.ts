import { TbEintrag } from './apis';

export interface AppState {
  readonly userId: string;
  readonly replicationServer: string;
  readonly diary: TbEintrag[];
}
