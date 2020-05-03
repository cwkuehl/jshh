import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Am000Component } from './components/user/am000.component';
import { Am500Component } from './components/user/am500.component';
import { Fz250Component } from './components/private/fz250.component';
import { Fz700Component } from './components/private/fz700.component';
import { Fz710Component } from './components/private/fz710.component';
import { Hh400Component } from './components/budget/hh400.component';
import { Hh410Component } from './components/budget/hh410.component';
import { So100Component } from './components/misc/so100.component';
import { Tb100Component } from './components/diary/tb100.component';
import { Tb100DeactivateGuard } from './guards/diary.guard';
//import { NotFoundPageComponent } from './containers/not-found-page';

const routes: Routes = [
  { path: '', redirectTo: 'bookings', pathMatch: 'full' },
  { path: 'login', component: Am000Component },
  { path: 'options', component: Am500Component },
  { path: 'mileages', component: Fz250Component },
  { path: 'memos', component: Fz700Component },
  { path: 'memo/:id', component: Fz710Component },
  { path: 'bookings', component: Hh400Component },
  { path: 'booking/:id/:copy', component: Hh410Component },
  { path: 'sudoku', component: So100Component },
  { path: 'diary', component: Tb100Component, canDeactivate: [Tb100DeactivateGuard] },
  // { path: '**', component: NotFoundPageComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
