// Section 1
import { Action } from '@ngrx/store'
import { TbEintrag } from './../apis'

// Section 2
export const SAVE_TB_EINTRAG = '[TB_EINTRAG] Save'
export const LOAD_TB_EINTRAG = '[TB_EINTRAG] Load'

// Section 3
export class SaveTbEintrag implements Action {
    readonly type = SAVE_TB_EINTRAG

    constructor(public payload: TbEintrag) {}
}

export class LoadTbEintrag implements Action {
    readonly type = LOAD_TB_EINTRAG

    constructor(public payload: number) {}
}

// Section 4
export type Actions = SaveTbEintrag | LoadTbEintrag