import { TestBed } from '@angular/core/testing';

import { KeyGeneratorService } from './key-generator.service';

describe('KeyGeneratorService', () => {
  let keyGenerator$: KeyGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    keyGenerator$ = TestBed.inject(KeyGeneratorService);
  });

  it('Keys should be different', () => {
    const keys = new Set<string>();

    const totalKeys = 500;
    let numKeys = totalKeys;
    while (numKeys--) {
      keys.add(keyGenerator$.newKey());
    }

    /* Sets only store one copy of something*/
    expect(keys.size).toBe(totalKeys);
  });
});
