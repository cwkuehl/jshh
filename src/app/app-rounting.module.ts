import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TagebuchComponent } from './components/tagebuch/tagebuch.component';

const routes: Routes = [
    {path: '', redirectTo: 'tagebuch', pathMatch: 'full'},
    { path: 'tagebuch', component: TagebuchComponent},
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
