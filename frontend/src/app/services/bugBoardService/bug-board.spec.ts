import { TestBed } from '@angular/core/testing';

import { BugBoard } from './bug-board';

describe('BugBoard', () => {
  let service: BugBoard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BugBoard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
