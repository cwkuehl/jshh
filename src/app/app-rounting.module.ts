import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Fz700Component } from './components/private/fz700/fz700.component';
import { Tb100Component } from './components/diary/tb100.component';

const routes: Routes = [
    {path: '', redirectTo: 'diary', pathMatch: 'full'},
    { path: 'memos', component: Fz700Component},
    { path: 'diary', component: Tb100Component},
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
