import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeTimepickerComponent } from './customize-timepicker.component';

describe('CustomizeTimepickerComponent', () => {
  let component: CustomizeTimepickerComponent;
  let fixture: ComponentFixture<CustomizeTimepickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomizeTimepickerComponent]
    });
    fixture = TestBed.createComponent(CustomizeTimepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
