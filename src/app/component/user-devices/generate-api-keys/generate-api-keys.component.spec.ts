import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateApiKeysComponent } from './generate-api-keys.component';

describe('GenerateApiKeysComponent', () => {
  let component: GenerateApiKeysComponent;
  let fixture: ComponentFixture<GenerateApiKeysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateApiKeysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateApiKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
