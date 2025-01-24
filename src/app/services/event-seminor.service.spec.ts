import { TestBed } from '@angular/core/testing';

import { EventSeminorService } from './event-seminor.service';

describe('EventSeminorService', () => {
  let service: EventSeminorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventSeminorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
