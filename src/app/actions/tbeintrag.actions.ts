// Section 1
import { Injectable } from '@angular/core'
import { Action } from '@ngrx/store'
import { TbEintrag } from './../apis'

// Section 2
export const ADD_TB_EINTRAG       = '[TB_EINTRAG] Add'
export const REMOVE_TB_EINTRAG    = '[TB_EINTRAG] Remove'

// Section 3
export class AddTbEintrag implements Action {
    readonly type = ADD_TB_EINTRAG

    constructor(public payload: TbEintrag) {}
}

export class RemoveTbEintrag implements Action {
    readonly type = REMOVE_TB_EINTRAG

    constructor(public payload: number) {}
}

// Section 4
export type Actions = AddTbEintrag | RemoveTbEintrag