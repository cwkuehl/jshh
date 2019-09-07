import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Fz700Component } from './fz700.component';

describe('Fz700Component', () => {
  let component: Fz700Component;
  let fixture: ComponentFixture<Fz700Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Fz700Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Fz700Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
