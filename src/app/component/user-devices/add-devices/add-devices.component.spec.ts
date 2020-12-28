import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDevicesComponent } from './add-devices.component';

describe('GenerateApiKeysComponent', () => {
  let component: AddDevicesComponent;
  let fixture: ComponentFixture<AddDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
