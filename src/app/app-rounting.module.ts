import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Am000Component } from './components/user/am000/am000.component';
import { Fz700Component } from './components/private/fz700/fz700.component';
import { Tb100Component } from './components/diary/tb100.component';
import { Tb100DeactivateGuard } from './guards/diary.guard';
//import { NotFoundPageComponent } from './containers/not-found-page';

const routes: Routes = [
    { path: '', redirectTo: 'diary', pathMatch: 'full' },
    { path: 'login', component: Am000Component },
    { path: 'memos', component: Fz700Component },
    { path: 'diary', component: Tb100Component, canDeactivate: [ Tb100DeactivateGuard ] },
    // { path: '**', component: NotFoundPageComponent }
];
@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
