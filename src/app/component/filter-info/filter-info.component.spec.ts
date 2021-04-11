import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterInfoComponent } from './filter-info.component';

describe('FilterInfoComponent', () => {
  let component: FilterInfoComponent;
  let fixture: ComponentFixture<FilterInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
