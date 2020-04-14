import { FzNotiz, Options, TbEintrag, HhBuchung } from './apis';

export interface AppState {
  readonly globalError: string;
  readonly userId: string;
  readonly options: Options;
  // readonly memos: FzNotiz[];
  // readonly bookings: HhBuchung[];
  // readonly diary: TbEintrag[];
}
