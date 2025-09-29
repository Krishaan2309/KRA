import { TestBed } from '@angular/core/testing';

import { HttpsCallsService } from './https-calls.service';

describe('HttpsCallsService', () => {
  let service: HttpsCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpsCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
