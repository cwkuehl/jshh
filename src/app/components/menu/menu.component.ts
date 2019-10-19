import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  title:string = '';

  constructor() { }

  ngOnInit() {
    this.title = 'JSHH ' + environment.date;
  }

}
