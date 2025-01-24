import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRegistrationlistDialogComponent } from './event-registrationlist-dialog.component';

describe('EventRegistrationlistDialogComponent', () => {
  let component: EventRegistrationlistDialogComponent;
  let fixture: ComponentFixture<EventRegistrationlistDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventRegistrationlistDialogComponent]
    });
    fixture = TestBed.createComponent(EventRegistrationlistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
