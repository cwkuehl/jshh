import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagebuchComponent } from './tagebuch.component';

describe('TagebuchComponent', () => {
  let component: TagebuchComponent;
  let fixture: ComponentFixture<TagebuchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagebuchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagebuchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
