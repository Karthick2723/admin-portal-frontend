import { TestBed } from '@angular/core/testing';

import { EventRegistrationServiceService } from './event-registration-service.service';

describe('EventRegistrationServiceService', () => {
  let service: EventRegistrationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventRegistrationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
