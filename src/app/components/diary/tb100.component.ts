import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { TbEintrag } from '../../apis';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-tb100',
  templateUrl: './tb100.component.html',
  styleUrls: ['./tb100.component.css']
})
export class Tb100Component implements OnInit {

  // Section 1
  diary: Observable<TbEintrag[]>;

  // Section 2
  constructor(private store: Store<AppState>) {
    this.diary = store.select('diary');
  }

  ngOnInit() {
  }

}
