import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceSensorComponent } from './device-sensor.component';

describe('DeviceSensorComponent', () => {
  let component: DeviceSensorComponent;
  let fixture: ComponentFixture<DeviceSensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceSensorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
