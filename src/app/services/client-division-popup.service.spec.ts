import { TestBed } from '@angular/core/testing';

import { ClientDivisionPopupService } from './client-division-popup.service';

describe('ClientDivisionPopupService', () => {
  let service: ClientDivisionPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientDivisionPopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
