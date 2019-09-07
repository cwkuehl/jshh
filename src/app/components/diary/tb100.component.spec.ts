import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Tb100Component } from './tb100.component';

describe('Tb100Component', () => {
  let component: Tb100Component;
  let fixture: ComponentFixture<Tb100Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Tb100Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Tb100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
