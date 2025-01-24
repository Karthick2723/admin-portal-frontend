import { TestBed } from '@angular/core/testing';

import { UserManageentService } from './user-manageent.service';

describe('UserManageentService', () => {
  let service: UserManageentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserManageentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
