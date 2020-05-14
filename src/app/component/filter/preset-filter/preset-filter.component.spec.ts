import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetFilterComponent } from './preset-filter.component';

describe('PresetFilterComponent', () => {
  let component: PresetFilterComponent;
  let fixture: ComponentFixture<PresetFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresetFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
