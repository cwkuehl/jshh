import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Am500Component } from './am500.component';

describe('Am500Component', () => {
  let component: Am500Component;
  let fixture: ComponentFixture<Am500Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Am500Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Am500Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
