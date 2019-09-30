import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Am000Component } from './am000.component';

describe('Am000Component', () => {
  let component: Am000Component;
  let fixture: ComponentFixture<Am000Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Am000Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Am000Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
