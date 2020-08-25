import { IdGenerator } from './id-generator';

describe('ID Counter', () => {
  let counter;

  beforeEach(() => {
    counter = new IdGenerator();
  });

  it('Should create IDs greater than 0', () => {
    expect(counter.nextId()).toBeGreaterThan(0);
    expect(counter.nextId()).toBeGreaterThan(0);
    expect(counter.nextId()).toBeGreaterThan(0);
    expect(counter.nextId()).toBeGreaterThan(0);
  });

  it('Should create different IDs', () => {
    // Create a set of IDs
    const idSet = new Set<number>();

    // Fill the set with IDs.
    const numberOfIds = 100;
    for (let i = 0; i < numberOfIds; i++) {
      idSet.add(counter.nextId());
    }

    /* Since sets does not allow repeated elements, the value of numberOfIds
     * must be equal to the size of the set. */
    expect(idSet.size).toBe(numberOfIds);
  });
});
