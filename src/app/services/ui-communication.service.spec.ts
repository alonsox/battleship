import { TestBed } from '@angular/core/testing';

import { UiCommunicationService } from './ui-communication.service';

describe('NewShipServiceService', () => {
  let service: UiCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
