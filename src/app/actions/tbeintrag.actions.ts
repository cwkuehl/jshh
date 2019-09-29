import { Action } from '@ngrx/store'
import { TbEintrag } from './../apis'

export const SAVE_TB_EINTRAG = '[TB_EINTRAG] Save'
export const LOAD_TB_EINTRAG = '[TB_EINTRAG] Load'
export const EMPTY_TB_EINTRAG = '[TB_EINTRAG] Empty'
export const ERROR_TB_EINTRAG = '[TB_EINTRAG] Error'

/* Speichern eines Tagebucheintrags */
export class SaveTbEintrag implements Action {
    readonly type = SAVE_TB_EINTRAG

    constructor(public payload: TbEintrag) {}
}

export class LoadTbEintrag implements Action {
    readonly type = LOAD_TB_EINTRAG

    constructor(public payload: number) {}
}

/* Action, die nichts machts. */
export class EmptyTbEintrag implements Action {
  readonly type = EMPTY_TB_EINTRAG

  constructor() {}
}

/* Fehler bei der Tagebuch-Verarbeitung. */
export class ErrorTbEintrag implements Action {
  readonly type = ERROR_TB_EINTRAG

  constructor(public payload: string) {}
}

export type Actions = SaveTbEintrag | LoadTbEintrag | EmptyTbEintrag | ErrorTbEintrag
