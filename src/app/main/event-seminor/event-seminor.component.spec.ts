import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSeminorComponent } from './event-seminor.component';

describe('EventSeminorComponent', () => {
  let component: EventSeminorComponent;
  let fixture: ComponentFixture<EventSeminorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventSeminorComponent]
    });
    fixture = TestBed.createComponent(EventSeminorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
