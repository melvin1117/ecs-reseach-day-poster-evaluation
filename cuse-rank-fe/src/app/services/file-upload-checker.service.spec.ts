import { TestBed } from '@angular/core/testing';

import { FileUploadCheckerService } from './file-upload-checker.service';

describe('FileUploadCheckerService', () => {
  let service: FileUploadCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileUploadCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
