import { TestBed } from '@angular/core/testing';

import { CustomEditorImgpopupService } from './custom-editor-imgpopup.service';

describe('CustomEditorImgpopupService', () => {
  let service: CustomEditorImgpopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomEditorImgpopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
