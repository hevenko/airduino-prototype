import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirduinoComponent } from './airduino.component';

describe('AirduinoComponent', () => {
  let component: AirduinoComponent;
  let fixture: ComponentFixture<AirduinoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirduinoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirduinoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
