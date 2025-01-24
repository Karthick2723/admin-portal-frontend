import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEventSeminorComponent } from './add-event-seminor.component';

describe('AddEventSeminorComponent', () => {
  let component: AddEventSeminorComponent;
  let fixture: ComponentFixture<AddEventSeminorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEventSeminorComponent]
    });
    fixture = TestBed.createComponent(AddEventSeminorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
