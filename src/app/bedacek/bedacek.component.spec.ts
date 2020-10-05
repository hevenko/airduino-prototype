import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedacekComponent } from './bedacek.component';

describe('BedacekComponent', () => {
  let component: BedacekComponent;
  let fixture: ComponentFixture<BedacekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedacekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedacekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
