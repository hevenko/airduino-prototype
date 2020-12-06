import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckRowRendererComponent } from './check-row-renderer.component';

describe('CheckRowRendererComponent', () => {
  let component: CheckRowRendererComponent;
  let fixture: ComponentFixture<CheckRowRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckRowRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckRowRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
