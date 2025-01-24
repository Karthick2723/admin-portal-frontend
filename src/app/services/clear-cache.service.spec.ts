import { TestBed } from '@angular/core/testing';

import { ClearCacheService } from './clear-cache.service';

describe('ClearCacheService', () => {
  let service: ClearCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClearCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
