import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiaryComponent } from './components/diary/diary.component';

const routes: Routes = [
    {path: '', redirectTo: 'diary', pathMatch: 'full'},
    { path: 'diary', component: DiaryComponent},
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
